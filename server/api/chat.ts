import express from 'express'
import { chatCompletion } from '../../src/services/openai'

export const router = express.Router()

router.post('/chat', async (req, res) => {
  try {
    const { messages, context } = req.body
    const response = await chatCompletion({ messages, context })
    res.json({ content: response })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Failed to process chat request' })
  }
})
