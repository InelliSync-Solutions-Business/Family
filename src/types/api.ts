export interface ChatCompletionResponse {
  success: boolean;
  message: string;
  error: string | null;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
