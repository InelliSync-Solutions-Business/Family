import express from 'express'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { chatCompletion } from '../../src/services/openai'

const router = express.Router()

router.post('/vectorize', async (req, res) => {
  try {
    const { filePath, userId, isShared } = req.body
    
    if (!isShared) return res.json({ success: true }) // Skip private files

    // 1. Extract text content
    const loader = filePath.endsWith('.pdf') 
      ? new PDFLoader(filePath) 
      : new TextLoader(filePath)
    const docs = await loader.load()

    // 2. Generate embeddings
    const embedding = await chatCompletion({
      messages: [{
        role: 'user',
        content: `Generate embedding for: ${docs[0].pageContent}`
      }],
      embedding: true
    })

    // 3. Store in Pinecone
    const vector = {
      id: `doc_${Date.now()}`,
      values: embedding.data[0].embedding,
      metadata: {
        documentId: filePath,
        userId,
        text: docs[0].pageContent,
        type: filePath.endsWith('.pdf') ? 'pdf' : 'text'
      }
    }

    const result = await upsertDocumentVectors([vector])
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Vectorization failed' })
  }
})

export default router
