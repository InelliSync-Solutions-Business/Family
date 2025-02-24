import { useState } from 'react';
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

interface ContentActions {
  like: (contentId: string) => void;
  share: (contentId: string) => void;
  delete: (contentId: string) => void;
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
    queryFn: async ({ pageParam = null }) => {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        items: [],
        nextCursor: null,
      } as FetchContentResponse;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Content actions
  const actions: ContentActions = {
    like: useMutation({
      mutationFn: async (contentId: string) => {
        // Mock API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['content'] });
      },
    }).mutateAsync,

    share: useMutation({
      mutationFn: async (contentId: string) => {
        // Mock API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
      },
    }).mutateAsync,

    delete: useMutation({
      mutationFn: async (contentId: string) => {
        // Mock API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['content'] });
      },
    }).mutateAsync,
  };

  return {
    content: data?.pages.flatMap(page => page.items) ?? [],
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    searchQuery,
    setSearchQuery,
    actions,
  };
}
