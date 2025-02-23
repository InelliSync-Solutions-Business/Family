import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { getEmbedding } from './openai'
import type { ProcessingResult, VectorData } from '../../src/types'

export async function processDocument(filePath: string, userId: string): Promise<ProcessingResult> {
  try {
    // Load document content
    const loader = filePath.endsWith('.pdf') 
      ? new PDFLoader(filePath)
      : new TextLoader(filePath)
    
    const rawDocs = await loader.load()
    
    // Split documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    })
    
    const docs = await splitter.splitDocuments(rawDocs)
    
    // Generate vectors
    const vectors: VectorData[] = await Promise.all(
      docs.map(async (doc, index) => ({
        id: `${filePath}-${index}-${Date.now()}`,
        values: await getEmbedding(doc.pageContent),
        metadata: {
          userId,
          documentId: filePath,
          text: doc.pageContent,
          type: filePath.endsWith('.pdf') ? 'pdf' : 'text',
          timestamp: new Date().toISOString()
        }
      }))
    )

    return {
      success: true,
      vectors
    }
  } catch (error) {
    console.error('Document processing failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during document processing'
    }
  }
}
