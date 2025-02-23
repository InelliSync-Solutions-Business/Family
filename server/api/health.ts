import express from 'express';
import { getIndexStats } from '../../src/services/pinecone';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const indexStats = await getIndexStats();
    
    res.json({
      status: 'OK',
      database: {
        totalVectors: indexStats.totalRecordCount,
        dimensions: indexStats.dimension
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR',
      error: 'Failed to fetch database stats'
    });
  }
});

export default router;
