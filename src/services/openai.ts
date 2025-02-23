import { OpenAI } from 'openai'
import fetch from 'node-fetch'

type ChatCompletionOptions = {
  context?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  maxTokens?: number
  temperature?: number
  model?: string
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})

const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL

export async function chatCompletion({ context, messages, maxTokens, temperature, model }: ChatCompletionOptions) {
  const systemMessage = context
    ? `You are a helpful family historian. Use this context to answer questions: ${context}`
    : 'You are a helpful assistant for a family legacy archive. Answer questions about family history and documents.'

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages, 
        context,
        maxTokens,
        temperature,
        model
      })
    })

    if (!response.ok) throw new Error('API request failed')

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('API error:', error)
    throw new Error('Failed to get AI response')
  }
}
