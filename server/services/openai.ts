import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('OpenAI embedding error:', error)
    throw new Error('Failed to generate embedding')
  }
}

export async function chatCompletion(options: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context?: string
}) {
  const systemMessage = options.context
    ? `You are a helpful family historian. Use this context to answer questions: ${options.context}`
    : 'You are a helpful assistant for a family legacy archive. Answer questions about family history and documents.'

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        ...options.messages
      ],
      max_tokens: 500,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('OpenAI chat completion error:', error)
    throw new Error('Failed to get AI response')
  }
}
