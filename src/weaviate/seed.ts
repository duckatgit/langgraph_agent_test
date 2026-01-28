import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';

dotenv.config();

const WEAVIATE_URL = process.env.WEAVIATE_URL || 'http://localhost:8080';
const WEAVIATE_TENANT = process.env.WEAVIATE_TENANT || 'default_tenant';

const seedData = [
    {
        fileId: 'doc_001',
        question: 'What is the annual revenue target for Q1 2024?',
        answer: 'The annual revenue target for Q1 2024 is $2.5 million, with a focus on expanding the enterprise client base by 30%.',
        pageNumber: ['3', '4'],
    },
    {
        fileId: 'doc_001',
        question: 'What are the key product features planned for the next release?',
        answer: 'The next release includes advanced analytics dashboard, multi-language support, and API rate limiting improvements.',
        pageNumber: ['12'],
    },
    {
        fileId: 'doc_002',
        question: 'What is the company policy on remote work?',
        answer: 'Employees can work remotely up to 3 days per week. All remote work requires approval from the direct manager and must maintain productivity standards.',
        pageNumber: ['7', '8'],
    },
    {
        fileId: 'doc_002',
        question: 'What are the vacation day entitlements?',
        answer: 'Full-time employees receive 20 vacation days per year, plus 10 public holidays. Vacation days accrue monthly at a rate of 1.67 days per month.',
        pageNumber: ['15'],
    },
    {
        fileId: 'doc_003',
        question: 'How does the authentication system work?',
        answer: 'The system uses JWT tokens with OAuth 2.0 for authentication. Tokens expire after 24 hours and refresh tokens are valid for 30 days.',
        pageNumber: ['22', '23', '24'],
    },
]

async function seedWeaviate() {
    try {
    console.log('🔌 Connecting to Weaviate at:', WEAVIATE_URL)
    
    const client = weaviate.client({
        scheme: 'http',
        host: WEAVIATE_URL.replace('http://', '').replace('https://', ''),
    })
    
    const isReady = await client.misc.readyChecker().do();
    if (!isReady) {
        console.error('❌ Weaviate is not ready. Please check the connection and try again.');
        return;
    }
    console.log('✅ Connected to Weaviate successfully.');

    console.log('creating tenantt if not exists:', WEAVIATE_TENANT);
    try {
        await client.schema.tenantsCreator('QA', [{
            name: WEAVIATE_TENANT,
        }]).do();
        console.log('✅ Tenant ensured:', WEAVIATE_TENANT);
    } catch (error) {
        console.error('❌ Error ensuring tenant:', error);
        return;
    }

    console.log(`Seeding data into Weaviate under tenant: ${WEAVIATE_TENANT}`);

    let successCount = 0;
    for (const item of seedData) {
        try {
            const result = await client.data
                .creator()
                .withClassName('QA')
                .withProperties(item)
                .withTenant(WEAVIATE_TENANT)
                .do();
            console.log('✅ Inserted item with ID:', result.id);
            successCount++;
        } catch (error) {
            console.error('❌ Error inserting item:', item, error);
        }
    }

    console.log(`Seeding completed. Successfully inserted ${successCount} out of ${seedData.length} items.`);

    // verify data
    console.log(`Verifying data in Weaviate under tenant: ${WEAVIATE_TENANT}`);
    const objects = await client.data
        .getter()
        .withClassName('QA')
        .withTenant(WEAVIATE_TENANT)
        .do();

    console.log(`✅ Found ${objects.objects?.length || 0} objects in the database`);
}
    catch (error) {
        console.error('❌ Error during seeding process:', error);
    }
}

seedWeaviate();