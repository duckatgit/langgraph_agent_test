# LangGraph Agent System

A production-ready hierarchical AI agent system built with **LangGraph**, **LangChain**, **Weaviate**, and **OpenAI GPT**, featuring intelligent query routing, RAG capabilities, and real-time streaming responses.

## 🏗️ Architecture Overview

This project implements a sophisticated multi-agent system with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                      Express Server                          │
│                    (Streaming SSE API)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Delegating Agent                            │
│         (Smart Routing & Orchestration)                      │
│                                                              │
│  Decision Logic:                                             │
│  ├─ "chart/graph" → Chart Tool                              │
│  ├─ "document/file" → RAG Agent                             │
│  ├─ Both keywords → Parallel Execution                      │
│  └─ Simple query → Direct LLM Response                      │
└────────┬─────────────────────────┬─────────────────────────┘
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌─────────────────────┐
│   Chart Tool     │      │     RAG Agent       │
│                  │      │                     │
│ - Bar Chart      │      │ - Weaviate Query    │
│ - Line Chart     │      │ - Keyword Matching  │
│ - Pie Chart      │      │ - GPT Synthesis     │
│ - Doughnut       │      │ - Reference Format  │
└──────────────────┘      └──────────┬──────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Weaviate Vector DB  │
                          │   (Multi-tenancy)    │
                          │   QA Knowledge Base  │
                          └──────────────────────┘
```

## ✨ Key Features

- **🤖 Intelligent Routing**: Automatically routes queries to appropriate tools/agents
- **🔀 Parallel Execution**: Executes multiple tools simultaneously when needed
- **📊 Chart Generation**: Creates Chart.js visualizations on demand
- **📚 RAG System**: Retrieves and synthesizes information from knowledge base
- **🌊 Real-time Streaming**: Server-Sent Events (SSE) for live response streaming
- **🎯 Multi-tenancy**: Isolated data access with Weaviate tenants
- **🔧 Production Ready**: Comprehensive error handling and logging
- **✅ Fully Tested**: Complete test coverage for all components

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **Docker** and **Docker Compose**
- **OpenAI API Key**

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd langgraph-agent-test
npm install
```

### 2. Configure Environment

Create or update `.env` file:

```bash
OPENAI_API_KEY=your_actual_openai_api_key_here

WEAVIATE_URL=http://localhost:8080
WEAVIATE_TENANT=default_tenant

PORT=3000
```

### 3. Start Weaviate

```bash
docker-compose up -d
```

Wait a few seconds for Weaviate to initialize, then verify it's running:

```bash
curl http://localhost:8080/v1/meta
```

### 4. Initialize Database

```bash
# Create schema with multi-tenancy
npm run schema

# Seed sample data (5 QA entries)
npm run seed
```

### 5. Run Tests (Optional)

```bash
# Test individual components
npm run test:chart        # Chart tool tests
npm run test:rag          # RAG agent tests
npm run test:delegating   # Delegating agent tests
npm run test:streaming    # Streaming & delegation tests

# Run all tests
npm run test:all
```

### 6. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode (requires build first)
npm run build
npm start
```

Server will be available at `http://localhost:3000`

## 📡 API Usage

### Health Check

```bash
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "service": "LangGraph Agent System"
}
```

### Query Endpoint (Streaming)

```bash
POST http://localhost:3000/ask
Content-Type: application/json

{
  "query": "Show me a bar chart of quarterly revenue"
}
```

**Response** (Server-Sent Events):

```
data: {"type":"chunk","content":"Here"}

data: {"type":"chunk","content":" is"}

data: {"type":"chunk","content":" a"}

...

data: {"type":"complete","answer":"Full response...","data":[{"type":"chart","config":{...}}]}

data: [DONE]
```

### Example Queries

#### 1. Chart Query
```json
{
  "query": "Create a pie chart showing revenue distribution"
}
```

**Routes to:** Chart Tool  
**Returns:** Chart.js configuration

#### 2. Document Query
```json
{
  "query": "What does the employee handbook say about vacation policy?"
}
```

**Routes to:** RAG Agent  
**Returns:** Answer with document references

#### 3. Combined Query
```json
{
  "query": "Show me a chart and explain the Q1 targets from the document"
}
```

**Routes to:** Both Chart Tool + RAG Agent (parallel)  
**Returns:** Chart config + Document references

#### 4. Direct Query
```json
{
  "query": "What is 2 + 2?"
}
```

**Routes to:** Direct LLM  
**Returns:** Simple answer without tools

## 🧪 Testing

### Manual Testing with cURL

```bash
# Chart query
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me a bar chart"}'

# RAG query
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is in the employee handbook?"}'

# Combined query
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me a graph and explain the policy document"}'
```

### Automated Tests

```bash
# Individual component tests
npm run test:chart        # ✅ Chart tool functionality
npm run test:rag          # ✅ RAG agent with Weaviate
npm run test:delegating   # ✅ Routing and orchestration
npm run test:streaming    # ✅ Streaming and decision logic

# All tests
npm run test:all
```

## 🗂️ Project Structure

```
langgraph-agent-test/
├── docker-compose.yml          # Weaviate configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env                       # Environment variables
├── .gitignore                # Git ignore rules
│
├── src/
│   ├── server.ts             # Express server with SSE
│   │
│   ├── agents/
│   │   ├── delegatingAgent.ts    # Main orchestrator
│   │   └── ragAgent.ts           # RAG implementation
│   │
│   ├── tools/
│   │   └── chartTool.ts          # Chart.js generator
│   │
│   ├── weaviate/
│   │   ├── schema.ts             # Schema creation
│   │   └── seed.ts               # Data seeding
│   │
│   └── tests/
│       ├── testChartTool.ts      # Chart tool tests
│       ├── testRAGAgent.ts       # RAG agent tests
│       ├── testDelegatingAgent.ts # Orchestration tests
│       └── testStreaming.ts      # Streaming tests
│
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `WEAVIATE_URL` | Weaviate instance URL | `http://localhost:8080` |
| `WEAVIATE_TENANT` | Tenant name for multi-tenancy | `default_tenant` |
| `PORT` | Server port | `3000` |

### Weaviate Schema

The system uses a `QA` class with the following properties:

- **fileId** (text): Document identifier (not searchable)
- **question** (text): Question text (searchable)
- **answer** (text): Answer text (searchable)
- **pageNumber** (text[]): Array of page numbers

**Multi-tenancy:** Enabled  
**Vectorizer:** None (uses fetchObjects fallback)

## 🎯 Decision Logic

The delegating agent uses keyword-based routing:

| Keywords Detected | Route To | Execution |
|------------------|----------|-----------|
| chart, graph, plot, visualize | Chart Tool | Single tool |
| document, file, question, explain | RAG Agent | Single tool |
| Both sets of keywords | Both Tools | Parallel |
| None of the above | Direct LLM | No tools |

## 🌊 Streaming Implementation

The server uses **Server-Sent Events (SSE)** for real-time streaming:

1. Client sends POST request to `/ask`
2. Server sets SSE headers (`text/event-stream`)
3. LLM generates response in chunks
4. Each chunk sent as `data: {"type":"chunk","content":"..."}`
5. Final response sent with complete data
6. Stream ends with `data: [DONE]`

## 📊 Response Format

### Chart Response
```json
{
  "answer": "Here is your chart...",
  "data": [
    {
      "type": "chart",
      "config": {
        "type": "bar",
        "data": { ... },
        "options": { ... }
      }
    }
  ]
}
```

### RAG Response
```json
{
  "answer": "According to the documents...\n\nReferences:\n1 - Page 3, 4",
  "data": [
    {
      "type": "reference",
      "fileId": "doc_001",
      "pageNumber": ["3", "4"]
    }
  ]
}
```

## 🛠️ Development

### Adding New Tools

1. Create tool in `src/tools/`
2. Export tool function
3. Import in `delegatingAgent.ts`
4. Add routing logic in `analyzeQuery()`
5. Add tool execution in decision logic

### Adding New Keywords

Update the keyword arrays in `delegatingAgent.ts`:

```typescript
const chartKeywords = ['chart', 'graph', 'plot', 'your-new-keyword'];
const ragKeywords = ['document', 'file', 'your-new-keyword'];
```

### Modifying Schema

1. Update schema in `src/weaviate/schema.ts`
2. Run `npm run schema` to recreate
3. Update seed data in `src/weaviate/seed.ts`
4. Run `npm run seed` to populate

## 🐛 Troubleshooting

### Weaviate Connection Failed

```bash
# Check if Weaviate is running
docker ps | grep weaviate

# Restart Weaviate
docker-compose down
docker-compose up -d

# Check logs
docker logs weaviate-langgraph
```

### Schema Creation Failed

```bash
# Delete and recreate
docker-compose down -v
docker-compose up -d
sleep 5
npm run schema
npm run seed
```

### OpenAI API Errors

- Verify API key is correct in `.env`
- Check OpenAI account has credits
- Ensure model access (gpt-3.5-turbo or gpt-4)

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📝 npm Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run schema` | Create Weaviate schema |
| `npm run seed` | Seed sample data |
| `npm run test:chart` | Test chart tool |
| `npm run test:rag` | Test RAG agent |
| `npm run test:delegating` | Test delegating agent |
| `npm run test:streaming` | Test streaming & delegation |
| `npm run test:all` | Run all tests |

## 🔐 Security Notes

- Never commit `.env` file (included in `.gitignore`)
- Use environment variables for sensitive data
- Rotate API keys regularly
- Use HTTPS in production
- Implement rate limiting for production use
- Add authentication for production endpoints

## 📦 Dependencies

### Core Dependencies
- **@langchain/core** ^1.1.17 - LangChain core functionality
- **@langchain/langgraph** ^1.1.2 - State graph for agents
- **@langchain/openai** ^1.2.3 - OpenAI integration
- **langchain** ^1.2.14 - LangChain framework
- **weaviate-ts-client** ^2.2.0 - Weaviate TypeScript client
- **express** ^5.2.1 - Web server framework
- **dotenv** ^17.2.3 - Environment variable management
- **zod** ^4.3.6 - Schema validation

### Dev Dependencies
- **typescript** ^5.9.3 - TypeScript compiler
- **tsx** ^4.21.0 - TypeScript executor
- **@types/node** ^25.0.10 - Node.js type definitions
- **@types/express** ^5.0.6 - Express type definitions

## 📄 License

MIT

## 👥 Contributing

This is an assessment project. For production use, consider:
- Adding authentication and authorization
- Implementing rate limiting
- Adding comprehensive logging
- Setting up monitoring and alerting
- Implementing CI/CD pipeline
- Adding more comprehensive error handling
- Writing integration tests
- Adding API documentation (OpenAPI/Swagger)

## 🎓 Learning Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

## 📞 Support

For issues and questions:
1. Check the Troubleshooting section
2. Review test files for usage examples
3. Check component logs for detailed error messages

---

**Built with ❤️ using LangGraph, LangChain, and Weaviate**
