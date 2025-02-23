import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

export class PineconeService {
  private pinecone: Pinecone;
  private index: any;
  private openai: OpenAI;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || ''
    });
    this.index = this.pinecone.index(process.env.PINECONE_INDEX || '');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async search(query: string, topK: number = 10) {
    // Get embedding for the search query
    const embedding = await this.getEmbedding(query);
    
    // Search Pinecone with the embedding
    const results = await this.queryVectors(embedding, topK);
    
    // Transform results to a more usable format
    return results.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    }));
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  }

  async upsertVectors(vectors: VectorData[]) {
    return await this.index.upsert(vectors);
  }

  async queryVectors(queryVector: number[], topK: number = 10) {
    return await this.index.query({
      vector: queryVector,
      topK,
      includeMetadata: true
    });
  }

  async deleteVectors(ids: string[]) {
    return await this.index.deleteMany(ids);
  }

  // Helper method to generate embedding and upsert content
  async indexContent(id: string, content: string, metadata?: Record<string, any>) {
    const embedding = await this.getEmbedding(content);
    await this.upsertVectors([{
      id,
      values: embedding,
      metadata
    }]);
  }
}

export interface VectorData {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

// Create and export a singleton instance
const pineconeService = new PineconeService();
export default pineconeService;
