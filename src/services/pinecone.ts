import { Pinecone } from '@pinecone-database/pinecone'
import type { DocumentMetadata, VectorData } from '@/types'

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
})

export const documentsIndex = pc.Index<DocumentMetadata>(process.env.PINECONE_INDEX!)

export async function upsertDocumentVectors(vectors: VectorData[]) {
  try {
    await documentsIndex.upsert(vectors)
    return { success: true }
  } catch (error) {
    console.error('Pinecone upsert error:', error)
    // Implement retry logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    try {
      await documentsIndex.upsert(vectors)
      return { success: true }
    } catch (retryError) {
      console.error('Pinecone retry failed:', retryError)
      return { success: false, error: 'Vector storage failed after retry' }
    }
  }
}

export async function querySimilarVectors(
  embedding: number[],
  userId: string,
  topK = 5
) {
  try {
    return await documentsIndex.query({
      vector: embedding,
      topK,
      filter: { userId },
      includeMetadata: true
    })
  } catch (error) {
    console.error('Pinecone query error:', error)
    return { matches: [] }
  }
}

export async function getIndexStats() {
  try {
    return await documentsIndex.describeIndexStats()
  } catch (error) {
    console.error('Failed to get index stats:', error)
    throw error
  }
}
