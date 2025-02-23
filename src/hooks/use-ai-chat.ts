import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'react-query';
import { ContentItem } from '@/types/content';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContext {
  content?: ContentItem;
  referencedContent?: ContentItem[];
}

interface UseAIChatOptions {
  context?: ChatContext;
}

export function useAIChat({ context }: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch relevant content based on the conversation
  const { data: relevantContent } = useQuery({
    queryKey: ['relevantContent', messages],
    queryFn: async () => {
      if (messages.length === 0) return [];

      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== 'user') return [];

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: lastMessage.content,
          context: context?.content?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch relevant content');
      return response.json();
    },
    enabled: messages.length > 0,
  });

  // Send message to AI
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: {
            currentContent: context?.content,
            relevantContent,
            conversationHistory: messages,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          id: response.id,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      await sendMessageMutation.mutate(content);
    },
    [sendMessageMutation]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading: sendMessageMutation.isLoading,
    error: sendMessageMutation.error,
    sendMessage,
    clearChat,
    relevantContent,
  };
}
