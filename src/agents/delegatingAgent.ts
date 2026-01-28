import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ragAgent, RAGResponse } from './ragAgent.js';
import { generateChart, ChartConfig } from '../tools/chartTool.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Delegating Agent Response Structure
 */
export interface DelegatingAgentResponse {
  answer: string;
  data: Array<{
    type: 'reference' | 'chart';
    content: any;
  }>;
}

/**
 * Decision type for routing
 */
type DecisionType = 'rag' | 'chart' | 'both' | 'direct';

/**
 * Delegating Agent - Main orchestrator that routes queries to appropriate tools/agents
 */
export class DelegatingAgent {
  private readonly llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4.1',
      temperature: 0.7,
      streaming: true,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyzes the query to determine which tools/agents to call
   */
  private analyzeQuery(query: string): DecisionType {
    const queryLower = query.toLowerCase();
    
    // Keywords for chart generation
    const chartKeywords = ['chart', 'graph', 'plot', 'visualize', 'visualization', 'bar chart', 'pie chart'];
    const hasChartKeyword = chartKeywords.some(keyword => queryLower.includes(keyword));
    
    // Keywords for document/RAG queries
    const ragKeywords = ['document', 'file', 'policy', 'what is', 'how does', 'explain', 'tell me about', 'information'];
    const hasRAGKeyword = ragKeywords.some(keyword => queryLower.includes(keyword));
    
    if (hasChartKeyword && hasRAGKeyword) {
      return 'both';
    } else if (hasChartKeyword) {
      return 'chart';
    } else if (hasRAGKeyword) {
      return 'rag';
    }
    
    return 'direct';
  }

  /**
   * Main query handler with streaming support
   */
  async query(
    userQuery: string,
    onStream?: (chunk: string) => void
  ): Promise<DelegatingAgentResponse> {
    console.log(`🤖 Delegating Agent received query: "${userQuery}"`);
    
    // Analyze query to determine routing
    const decision = this.analyzeQuery(userQuery);
    console.log(`🎯 Decision: ${decision}`);

    const data: Array<{ type: 'reference' | 'chart'; content: any }> = [];
    let contextInfo = '';

    // Execute appropriate tools/agents based on decision
    if (decision === 'rag' || decision === 'both') {
      console.log('📚 Calling RAG Agent...');
      const ragResponse: RAGResponse = await ragAgent.query(userQuery);
      
      if (ragResponse.references.length > 0) {
        data.push({
          type: 'reference',
          content: ragResponse.references,
        });
        
        contextInfo += `\n\nContext from knowledge base:\n${ragResponse.answer}\n`;
      }
    }

    if (decision === 'chart' || decision === 'both') {
      console.log('📊 Calling Chart Tool...');
      const chartConfig: ChartConfig = generateChart('bar');
      
      data.push({
        type: 'chart',
        content: chartConfig,
      });
      
      contextInfo += `\n\nChart data available: Quarterly revenue report with Q1: $2.5M, Q2: $3.2M, Q3: $2.8M, Q4: $4.1M\n`;
    }

    // Build the prompt for LLM
    const systemPrompt = `You are a helpful AI assistant with access to a knowledge base and visualization tools.
Your task is to provide clear, concise answers to user queries.

When referencing information from documents, use the format: [FileNumber - Page X]
For example: [1 - Page 3] refers to the first file, page 3.

${contextInfo}`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userQuery),
    ];

    // Stream the response
    let fullAnswer = '';
    
    try {
      console.log('💬 Streaming LLM response...');
      
      const stream = await this.llm.stream(messages);
      
      for await (const chunk of stream) {
        const content = chunk.content as string;
        if (content) {
          fullAnswer += content;
          if (onStream) {
            onStream(content);
          }
        }
      }
      
      console.log('✅ Streaming complete');
      
    } catch (error: any) {
      console.error('❌ LLM streaming error:', error.message);
      fullAnswer = 'I apologize, but I encountered an error while processing your request.';
      
      // If we have context from RAG, provide it as fallback
      if (decision === 'rag' && contextInfo) {
        fullAnswer = contextInfo;
      }
    }

    return {
      answer: fullAnswer,
      data,
    };
  }

  /**
   * Query without streaming (for testing)
   */
  async querySync(userQuery: string): Promise<DelegatingAgentResponse> {
    return this.query(userQuery);
  }
}

/**
 * Create and export a singleton instance
 */
export const delegatingAgent = new DelegatingAgent();
