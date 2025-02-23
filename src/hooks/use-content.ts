import { useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContentItem, ContentType } from '@/types/content';

interface UseContentOptions {
  pageSize?: number;
  isPrivate?: boolean;
  contentType?: ContentType;
  tags?: string[];
}

interface FetchContentResponse {
  items: ContentItem[];
  nextCursor?: string;
}

export function useContent({
  pageSize = 12,
  isPrivate,
  contentType,
  tags,
}: UseContentOptions = {}) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch content with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['content', { isPrivate, contentType, tags, searchQuery }],
    queryFn: async ({ pageParam = '' }) => {
      const params = new URLSearchParams({
        cursor: pageParam,
        limit: pageSize.toString(),
        ...(isPrivate !== undefined && { isPrivate: isPrivate.toString() }),
        ...(contentType && { type: contentType }),
        ...(tags?.length && { tags: tags.join(',') }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/content?${params}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json() as Promise<FetchContentResponse>;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Like content
  const likeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/content/${contentId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to like content');
      return response.json();
    },
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });

  // Share content
  const shareMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/content/${contentId}/share`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to share content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });

  // Delete content
  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete content');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    content: data?.pages.flatMap((page) => page.items) ?? [],
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    searchQuery,
    handleSearch,
    actions: {
      like: likeMutation.mutate,
      share: shareMutation.mutate,
      delete: deleteMutation.mutate,
    },
  };
}
