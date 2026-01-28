import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { delegatingAgent } from './agents/delegatingAgent.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LangGraph Agent System',
  });
});

/**
 * Main query endpoint with streaming support
 * POST /ask
 * Body: { query: string }
 */
app.post('/ask', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. "query" field is required and must be a string.',
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📨 Received query: "${query}"`);
    console.log('='.repeat(60));

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Track the complete response
    let completeAnswer = '';
    const data: any[] = [];

    // Query the delegating agent with streaming callback
    const response = await delegatingAgent.query(query, (chunk: string) => {
      // Stream each chunk as SSE
      completeAnswer += chunk;
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
    });

    // Send final response with complete data
    const finalResponse = {
      type: 'complete',
      answer: response.answer,
      data: response.data,
    };

    res.write(`data: ${JSON.stringify(finalResponse)}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

    console.log('✅ Response sent successfully\n');

  } catch (error: any) {
    console.error('❌ Error processing request:', error.message);
    
    // Check if headers already sent (streaming started)
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
});

/**
 * Non-streaming endpoint (for testing)
 * POST /ask-sync
 * Body: { query: string }
 */
app.post('/ask-sync', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. "query" field is required and must be a string.',
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📨 Received sync query: "${query}"`);
    console.log('='.repeat(60));

    const response = await delegatingAgent.querySync(query);

    console.log('✅ Response ready\n');

    res.json(response);

  } catch (error: any) {
    console.error('❌ Error processing request:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 LangGraph Agent Server Started');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Query endpoint (streaming): POST http://localhost:${PORT}/ask`);
  console.log(`💬 Query endpoint (sync): POST http://localhost:${PORT}/ask-sync`);
  console.log('='.repeat(60) + '\n');
  console.log('📝 Example request:');
  console.log(`curl -X POST http://localhost:${PORT}/ask \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"query": "What is the revenue target for Q1?"}'`);
  console.log('\n' + '='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
