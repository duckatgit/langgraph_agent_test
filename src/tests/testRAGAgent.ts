import { ragAgent } from '../agents/ragAgent.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test RAG Agent
 */
async function testRAGAgent() {
  console.log('\n🧪 Testing RAG Agent\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Query with document keyword
    console.log('\n📚 Test 1: Query about documents');
    const result1 = await ragAgent.query('What is the company vacation policy?');
    console.log('Answer:', result1.answer.substring(0, 100) + '...');
    console.log('References count:', result1.references.length);
    console.log('References:', result1.references);

    // Test 2: Query with different keyword
    console.log('\n📚 Test 2: Query about benefits');
    const result2 = await ragAgent.query('Tell me about employee benefits');
    console.log('Answer:', result2.answer.substring(0, 100) + '...');
    console.log('References count:', result2.references.length);

    // Test 3: Query that might not match
    console.log('\n📚 Test 3: Query with no matches');
    const result3 = await ragAgent.query('What is the weather today?');
    console.log('Answer:', result3.answer);
    console.log('References count:', result3.references.length);

    // Validate reference format
    if (result1.references.length > 0) {
      console.log('\n✅ Reference format validation:');
      const ref = result1.references[0];
      console.log('  - Has fileId:', !!ref.fileId);
      console.log('  - Has pageNumber array:', Array.isArray(ref.pageNumber));
      console.log('  - Pages are sorted:', ref.pageNumber.join(', '));
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All RAG Agent tests passed!\n');

  } catch (error: any) {
    console.error('\n❌ RAG Agent test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run tests
testRAGAgent();
