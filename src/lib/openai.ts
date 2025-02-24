import OpenAI from 'openai';
import { ChatCompletionResponse, Message } from '@/types/api';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: false // Note: In production, you should proxy these requests through your backend
});

interface ChatCompletionOptions {
  messages: Message[]
  context?: string
}

export async function chatCompletion({ messages, context }: ChatCompletionOptions): Promise<ChatCompletionResponse> {
  try {
    const systemMessage = {
      role: 'system' as const,
      content: context 
        ? `Context: ${context}`
        : 'You are a helpful family archive assistant.'
    };

    const completion = await openai.chat.completions.create({
      messages: [
        systemMessage,
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        }))
      ],
      model: "gpt-4o-mini",
    });

    return {
      success: true,
      message: completion.choices[0]?.message?.content || '',
      error: null
    };
  } catch (error) {
    console.error('Error in chat completion:', error);
    return {
      success: false,
      message: '',
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
}
