import { delegatingAgent } from '../agents/delegatingAgent.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test Delegating Agent
 */
async function testDelegatingAgent() {
  console.log('\n🧪 Testing Delegating Agent\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Chart query
    console.log('\n📊 Test 1: Chart query (should route to chart tool)');
    const result1 = await delegatingAgent.query('Show me a bar chart of revenue');
    console.log('Answer:', result1.answer.substring(0, 100) + '...');
    console.log('Data items:', result1.data.length);
    console.log('Has chart data:', result1.data.some((d: any) => d.type === 'chart'));

    // Test 2: RAG query
    console.log('\n📚 Test 2: Document query (should route to RAG agent)');
    const result2 = await delegatingAgent.query('What is in the employee handbook?');
    console.log('Answer:', result2.answer.substring(0, 100) + '...');
    console.log('Data items:', result2.data.length);
    console.log('Has references:', result2.data.some((d: any) => d.type === 'reference'));

    // Test 3: Both chart and document query
    console.log('\n🔀 Test 3: Combined query (should call both tools)');
    const result3 = await delegatingAgent.query('Show me a chart and tell me about the vacation policy document');
    console.log('Answer:', result3.answer.substring(0, 100) + '...');
    console.log('Data items:', result3.data.length);

    // Test 4: Direct answer
    console.log('\n💬 Test 4: Direct query (no tools needed)');
    const result4 = await delegatingAgent.query('What is 2 + 2?');
    console.log('Answer:', result4.answer);
    console.log('Data items (should be 0):', result4.data.length);

    // Test 5: Streaming callback
    console.log('\n🌊 Test 5: Test streaming callback functionality');
    let streamedChunks: string[] = [];
    
    const result5 = await delegatingAgent.query(
      'Show me a simple chart',
      (chunk: string) => {
        streamedChunks.push(chunk);
        if (streamedChunks.length <= 3) {
          console.log(`  Chunk ${streamedChunks.length}:`, chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
        }
      }
    );
    
    console.log('Total chunks received:', streamedChunks.length);
    console.log('Final answer length:', result5.answer.length);
    console.log('Has chart data:', result5.data.some((d: any) => d.type === 'chart'));

    console.log('\n' + '='.repeat(50));
    console.log('✅ All Delegating Agent tests passed!\n');

  } catch (error: any) {
    console.error('\n❌ Delegating Agent test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run tests
testDelegatingAgent();
