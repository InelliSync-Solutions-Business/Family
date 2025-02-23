import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import routes
import { router as chatRouter } from './api/chat'
import contentRouter from './api/content'
import healthRouter from './api/health'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}))
app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/vectorize', contentRouter)
app.use('/api/health', healthRouter)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
