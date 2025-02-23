import OpenAI from 'openai';
import { ChatCompletionResponse, Message } from '@/types/api';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy these requests through your backend
});

export async function chatCompletion(messages: Message[]): Promise<ChatCompletionResponse> {
  try {
    const completion = await openai.chat.completions.create({
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      model: "gpt-3.5-turbo",
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
