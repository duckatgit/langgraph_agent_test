import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';

dotenv.config();

const WEAVIATE_URL = process.env.WEAVIATE_URL || 'http://localhost:8080';
const WEAVIATE_TENANT = process.env.WEAVIATE_TENANT || 'default_tenant';

/**
 * Create Weaviate schema with QA class
 * Multi-tenancy enabled, no vectorization
 */
async function createSchema() {
  console.log('🔌 Connecting to Weaviate at:', WEAVIATE_URL);
  
  const client = weaviate.client({
    scheme: 'http',
    host: WEAVIATE_URL.replace('http://', '').replace('https://', ''),
  });

  try {
    // Check if schema already exists
    const existingSchema = await client.schema.getter().do();
    const qaClassExists = existingSchema.classes?.some(
      (c: any) => c.class === 'QA'
    );

    if (qaClassExists) {
      console.log('⚠️  QA class already exists. Deleting...');
      await client.schema.classDeleter().withClassName('QA').do();
      console.log('✅ Deleted existing QA class');
    }

    // Define QA class schema
    const qaClass = {
      class: 'QA',
      description: 'Question and Answer pairs from documents',
      multiTenancyConfig: {
        enabled: true,
      },
      properties: [
        {
          name: 'fileId',
          dataType: ['text'],
          description: 'Identifier of the source file',
          indexFilterable: false,
          indexSearchable: false,
        },
        {
          name: 'question',
          dataType: ['text'],
          description: 'The question text',
          indexFilterable: true,
          indexSearchable: true,
        },
        {
          name: 'answer',
          dataType: ['text'],
          description: 'The answer text',
          indexFilterable: true,
          indexSearchable: true,
        },
        {
          name: 'pageNumber',
          dataType: ['text[]'],
          description: 'Page numbers where this QA appears',
          indexFilterable: true,
          indexSearchable: false,
        },
      ],
      vectorizer: 'none',
    };

    // Create the schema
    console.log('📝 Creating QA class schema...');
    await client.schema.classCreator().withClass(qaClass).do();
    console.log('✅ QA class created successfully');

    // Create tenant
    console.log(`🏢 Creating tenant: ${WEAVIATE_TENANT}...`);
    await client.schema
      .tenantsCreator('QA', [{ name: WEAVIATE_TENANT }])
      .do();
    console.log(`✅ Tenant "${WEAVIATE_TENANT}" created successfully`);

    // Verify schema
    const schema = await client.schema.getter().do();
    const qaClassCreated = schema.classes?.find((c: any) => c.class === 'QA');
    
    if (qaClassCreated) {
      console.log('✅ Schema verification passed');
      console.log('📊 QA Class Details:');
      console.log(`   - Multi-tenancy: ${qaClassCreated.multiTenancyConfig?.enabled}`);
      console.log(`   - Vectorizer: ${qaClassCreated.vectorizer}`);
      console.log(`   - Properties: ${qaClassCreated.properties?.length}`);
    }

  } catch (error: any) {
    console.error('❌ Error creating schema:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run schema creation
createSchema()
  .then(() => {
    console.log('🎉 Schema setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

