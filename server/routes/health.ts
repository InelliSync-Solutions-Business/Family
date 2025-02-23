import express from 'express'
import { getIndexStats } from '../../src/services/pinecone'

const router = express.Router()

router.get('/health', async (_req, res) => {
  try {
    const indexStats = await getIndexStats()
    
    res.json({
      status: 'OK',
      pinecone: {
        dimension: indexStats.dimension,
        indexFullness: indexStats.indexFullness,
        namespaces: indexStats.namespaces
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
