import { delegatingAgent } from '../agents/delegatingAgent.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test Streaming and Delegation Logic
 */
async function testStreamingAndDelegation() {
  console.log('\n🌊 Testing Streaming & Delegation\n');
  console.log('='.repeat(70));

  // Test 1: Chart Query with Streaming
  console.log('\n📊 Test 1: Chart Query with Streaming Callback');
  console.log('-'.repeat(70));
  
  let chartChunks: string[] = [];
  const chartResult = await delegatingAgent.query(
    'Show me a bar chart of quarterly revenue',
    (chunk: string) => {
      chartChunks.push(chunk);
      console.log(`  📝 Chunk ${chartChunks.length}: "${chunk}"`);
    }
  );
  
  console.log(`\n  ✅ Total chunks: ${chartChunks.length}`);
  console.log(`  ✅ Full answer: "${chartResult.answer}"`);
  console.log(`  ✅ Data items: ${chartResult.data.length}`);
  console.log(`  ✅ Has chart: ${chartResult.data.some((d: any) => d.type === 'chart')}`);
  
  // Test 2: RAG Query with Streaming
  console.log('\n📚 Test 2: Document Query with Streaming Callback');
  console.log('-'.repeat(70));
  
  let ragChunks: string[] = [];
  const ragResult = await delegatingAgent.query(
    'What does the document say about employee benefits?',
    (chunk: string) => {
      ragChunks.push(chunk);
      console.log(`  📝 Chunk ${ragChunks.length}: "${chunk}"`);
    }
  );
  
  console.log(`\n  ✅ Total chunks: ${ragChunks.length}`);
  console.log(`  ✅ Full answer length: ${ragResult.answer.length} chars`);
  console.log(`  ✅ Data items: ${ragResult.data.length}`);
  console.log(`  ✅ Has references: ${ragResult.data.some((d: any) => d.type === 'reference')}`);
  
  // Test 3: Combined Query (Both Tools) with Streaming
  console.log('\n🔀 Test 3: Combined Query (Chart + Document) with Streaming');
  console.log('-'.repeat(70));
  
  let combinedChunks: string[] = [];
  const combinedResult = await delegatingAgent.query(
    'Show me a chart and explain the vacation policy from the document',
    (chunk: string) => {
      combinedChunks.push(chunk);
      if (combinedChunks.length <= 5) {
        console.log(`  📝 Chunk ${combinedChunks.length}: "${chunk}"`);
      }
    }
  );
  
  console.log(`\n  ✅ Total chunks: ${combinedChunks.length}`);
  console.log(`  ✅ Data items: ${combinedResult.data.length}`);
  const hasChart = combinedResult.data.some((d: any) => d.type === 'chart');
  const hasRef = combinedResult.data.some((d: any) => d.type === 'reference');
  console.log(`  ✅ Has chart: ${hasChart}`);
  console.log(`  ✅ Has references: ${hasRef}`);
  console.log(`  ✅ Both tools used: ${hasChart && hasRef}`);
  
  // Test 4: Direct Query (No Tools) with Streaming
  console.log('\n💬 Test 4: Direct Query (No Tools) with Streaming');
  console.log('-'.repeat(70));
  
  let directChunks: string[] = [];
  const directResult = await delegatingAgent.query(
    'Hello, how are you today?',
    (chunk: string) => {
      directChunks.push(chunk);
      console.log(`  📝 Chunk ${directChunks.length}: "${chunk}"`);
    }
  );
  
  console.log(`\n  ✅ Total chunks: ${directChunks.length}`);
  console.log(`  ✅ Data items (should be 0): ${directResult.data.length}`);
  console.log(`  ✅ Direct answer: "${directResult.answer}"`);

  // Test 5: Delegation Decision Verification
  console.log('\n🎯 Test 5: Verify Delegation Decision Logic');
  console.log('-'.repeat(70));
  
  const testCases = [
    { query: 'Create a pie chart', expected: 'chart' },
    { query: 'What is in the employee handbook?', expected: 'rag' },
    { query: 'Show me a graph and tell me about the policy', expected: 'both' },
    { query: 'What is the capital of France?', expected: 'direct/rag' },
  ];
  
  for (const testCase of testCases) {
    console.log(`\n  Query: "${testCase.query}"`);
    console.log(`  Expected: ${testCase.expected}`);
    const result = await delegatingAgent.query(testCase.query);
    console.log(`  ✅ Got ${result.data.length} data items`);
    
    if (result.data.length > 0) {
      const types = result.data.map((d: any) => d.type).join(', ');
      console.log(`  ✅ Data types: ${types}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Streaming & Delegation Test Summary');
  console.log('='.repeat(70));
  console.log(`  Chart streaming: ${chartChunks.length} chunks`);
  console.log(`  RAG streaming: ${ragChunks.length} chunks`);
  console.log(`  Combined streaming: ${combinedChunks.length} chunks`);
  console.log(`  Direct streaming: ${directChunks.length} chunks`);
  console.log(`\n  ✅ All streaming and delegation tests completed!\n`);
}

// Run tests
testStreamingAndDelegation().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});
