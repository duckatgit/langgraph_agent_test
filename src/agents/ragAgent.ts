import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import dotenv from 'dotenv';

dotenv.config();

const WEAVIATE_URL = process.env.WEAVIATE_URL || 'http://localhost:8080';
const WEAVIATE_TENANT = process.env.WEAVIATE_TENANT || 'default_tenant';

/**
 * Reference structure for RAG responses
 */
export interface Reference {
  fileId: string;
  pageNumber: string[];
}

/**
 * RAG Agent response structure
 */
export interface RAGResponse {
  answer: string;
  references: Reference[];
}

/**
 * QA object from Weaviate
 */
interface QAObject {
  properties: {
    fileId: string;
    question: string;
    answer: string;
    pageNumber: string[];
  };
}

/**
 * RAG Agent - Retrieves information from Weaviate and formats responses
 */
export class RAGAgent {
  private readonly client: WeaviateClient;

  constructor() {
    this.client = weaviate.client({
      scheme: 'http',
      host: WEAVIATE_URL.replace('http://', '').replace('https://', ''),
    });
  }

  /**
   * Query Weaviate for relevant QA pairs
   * Uses fetchObjects since we don't have embeddings
   */
  async query(userQuery: string): Promise<RAGResponse> {
    try {
      console.log(`🔍 RAG Agent querying for: "${userQuery}"`);

      // Fetch all objects from the QA class (no vector search)
      const result = await this.client.data
        .getter()
        .withClassName('QA')
        .withTenant(WEAVIATE_TENANT)
        .withLimit(100)
        .do();

      const objects = result.objects as unknown as QAObject[];

      if (!objects || objects.length === 0) {
        return {
          answer: 'No information found in the knowledge base.',
          references: [],
        };
      }

      // Simple keyword matching for relevance (since we don't have vector search)
      const queryLower = userQuery.toLowerCase();
      const relevantObjects = objects.filter((obj) => {
        const question = obj.properties.question.toLowerCase();
        const answer = obj.properties.answer.toLowerCase();
        return question.includes(queryLower) || 
               answer.includes(queryLower) ||
               queryLower.split(' ').some(word => 
                 word.length > 3 && (question.includes(word) || answer.includes(word))
               );
      });

      // If no keyword matches, return the first few objects
      const matchedObjects = relevantObjects.length > 0 
        ? relevantObjects.slice(0, 3)
        : objects.slice(0, 3);

      // Build the response
      const references: Reference[] = [];
      const fileIdMap = new Map<string, number>();
      let answerText = '';

      matchedObjects.forEach((obj, index) => {
        const { fileId, answer, pageNumber } = obj.properties;
        
        // Track unique fileIds and assign them numbers
        if (!fileIdMap.has(fileId)) {
          fileIdMap.set(fileId, fileIdMap.size + 1);
        }
        const fileNumber = fileIdMap.get(fileId) ?? 0;

        // Add to answer with reference
        answerText += `${answer}\n`;
        const pageRef = pageNumber.join(', ');
        answerText += `[${fileNumber} - Page ${pageRef}]\n\n`;

        // Add to references if not already present
        const existingRef = references.find(ref => ref.fileId === fileId);
        if (existingRef) {
          // Merge page numbers
          pageNumber.forEach(page => {
            if (!existingRef.pageNumber.includes(page)) {
              existingRef.pageNumber.push(page);
            }
          });
        } else {
          references.push({
            fileId,
            pageNumber: [...pageNumber],
          });
        }
      });

      console.log(`✅ RAG Agent found ${matchedObjects.length} relevant entries`);

      return {
        answer: answerText.trim() || 'Found relevant information but unable to formulate an answer.',
        references,
      };

    } catch (error: any) {
      console.error('❌ RAG Agent error:', error.message);
      return {
        answer: 'Error retrieving information from the knowledge base.',
        references: [],
      };
    }
  }

  /**
   * Format references for display
   */
  formatReferences(references: Reference[]): string {
    if (references.length === 0) return '';
    
    return '\n\nReferences:\n' + references.map((ref, idx) => {
      const pageList = ref.pageNumber.join(', ');
      return `${idx + 1}. ${ref.fileId} - Page ${pageList}`;
    }).join('\n');
  }
}

/**
 * Create and export a singleton instance
 */
export const ragAgent = new RAGAgent();
