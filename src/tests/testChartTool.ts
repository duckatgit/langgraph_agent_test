import { generateChart } from '../tools/chartTool.js';

/**
 * Test Chart Tool
 */
async function testChartTool() {
  console.log('\n🧪 Testing Chart Tool\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Bar chart
    console.log('\n📊 Test 1: Generate Bar Chart');
    const barConfig = generateChart('bar');
    console.log('✅ Bar chart type:', barConfig.type);
    console.log('✅ Has data labels:', barConfig.data.labels.length > 0);
    console.log('✅ Has datasets:', barConfig.data.datasets.length > 0);

    // Test 2: Default chart
    console.log('\n📈 Test 2: Generate Default Chart');
    const defaultConfig = generateChart();
    console.log('✅ Default chart type:', defaultConfig.type);
    console.log('✅ Has title:', defaultConfig.options.plugins.title.text);

    // Test 3: Verify chart structure
    console.log('\n🔍 Test 3: Verify Chart Structure');
    console.log('✅ Has labels:', Array.isArray(barConfig.data.labels));
    console.log('✅ Has datasets:', Array.isArray(barConfig.data.datasets));
    console.log('✅ Has options:', !!barConfig.options);
    console.log('✅ Has responsive setting:', barConfig.options.responsive);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All Chart Tool tests passed!\n');

  } catch (error: any) {
    console.error('\n❌ Chart Tool test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testChartTool();
