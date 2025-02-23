import express from 'express'
import { processDocument } from '../services/document-processor'
import { upsertDocumentVectors } from '../../src/services/pinecone'

const router = express.Router()

router.post('/vectorize', async (req, res) => {
  const { filePath, userId, isShared } = req.body
  
  if (!isShared) {
    return res.json({ success: true }) // Skip private files
  }

  try {
    const result = await processDocument(filePath, userId)
    
    if (!result.success || !result.vectors) {
      throw new Error(result.error || 'Processing failed')
    }

    const vectorResult = await upsertDocumentVectors(result.vectors)
    
    if (!vectorResult.success) {
      throw new Error(vectorResult.error || 'Vector storage failed')
    }
    
    res.json({ 
      success: true,
      documentId: filePath,
      chunks: result.vectors.length
    })
  } catch (error) {
    console.error('Vectorization error:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
