You are a senior typescript based Node.js AI systems engineer.

Generate a complete Node.js project that implements a hierarchical LangGraph agent system using:
- LangGraph
- LangChain
- Weaviate JS client
- Dockerized Weaviate with multi-tenancy
- GPT API as the LLM
- Streaming responses
- Modular clean architecture

This project is an assessment task and must be production-quality, well-structured, and easy to explain in a video.

========================
PROJECT REQUIREMENTS
========================

PART 1 — Weaviate Setup

1. Provide a docker-compose.yml that runs Weaviate with:
   - Multi-tenancy enabled
   - Text2vec disabled (no vectorizer)
   - Port 8080 exposed

2. Create a script `weaviate/schema.js` that:
   - Connects using weaviate-ts-client
   - Creates a class called "QA"
   - Multi-tenancy enabled
   - Properties:
        fileId: string (not vectorized, not searchable)
        question: text
        answer: text
        pageNumber: text[]

3. Create a script `weaviate/seed.js` that inserts at least 3 fictional entries.

IMPORTANT:
Do NOT provide vectors. Use fetchObjects fallback later.

========================
PART 2 — LANGGRAPH HIERARCHY
========================

Create the following architecture:

agents/
  delegatingAgent.js
  ragAgent.js
tools/
  chartTool.js

Delegating Agent Responsibilities:
- Receives user query
- Decides:
    -> Call Chart tool
    -> Call RAG agent
    -> Answer directly
- Can call both tools in parallel or sequence
- Returns STREAMED response in this schema:

{
  answer: string,      // streaming chunks
  data: object[]       // references or chart config
}

========================
RAG AGENT
========================

- Connect to Weaviate
- Use fetchObjects if no embeddings
- Return:
    {
      answer: string,
      references: [
        {
          fileId: string,
          pageNumber: string[]
        }
      ]
    }

When answering, format references like:
"1 - Page 3"
Where 1 corresponds to first returned fileId.

========================
CHART TOOL
========================

Create a mocked tool that returns a static Chart.js configuration object.

Example output:

{
  type: 'bar',
  data: {...},
  options: {...}
}

========================
DELEGATION LOGIC
========================

If query contains words like:
"chart", "graph", "plot" → use chart tool
If query asks about documents, files, questions → use RAG
If both → call both

========================
STREAMING
========================

Use LangChain streaming with GPT.

Delegating agent should stream chunks while still collecting tool outputs.

========================
SERVER
========================

Create `server.js` with Express:

POST /ask
body: { query: string }

Respond with streaming chunks.

========================
ENV
========================

Use `.env` with:
OPENAI_API_KEY=

========================
OUTPUT EXPECTATION
========================

Generate all files:
- docker-compose.yml
- package.json
- weaviate/schema.js
- weaviate/seed.js
- agents/ragAgent.js
- agents/delegatingAgent.js
- tools/chartTool.js
- server.js

Use modern ES modules.

Code must be clean, commented, and ready to run.

Now start by generating docker-compose.yml
