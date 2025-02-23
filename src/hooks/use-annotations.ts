import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContentAnnotation } from '@/types/content';

interface UseAnnotationsOptions {
  contentId: string;
}

export function useAnnotations({ contentId }: UseAnnotationsOptions) {
  const queryClient = useQueryClient();

  // Fetch annotations
  const {
    data: annotations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['annotations', contentId],
    queryFn: async () => {
      const response = await fetch(`/api/content/${contentId}/annotations`);
      if (!response.ok) throw new Error('Failed to fetch annotations');
      return response.json() as Promise<ContentAnnotation[]>;
    },
  });

  // Add annotation
  const addMutation = useMutation({
    mutationFn: async (annotation: Omit<ContentAnnotation, 'id' | 'createdAt'>) => {
      const response = await fetch(`/api/content/${contentId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotation),
      });
      if (!response.ok) throw new Error('Failed to add annotation');
      return response.json() as Promise<ContentAnnotation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] });
    },
  });

  // Update annotation
  const updateMutation = useMutation({
    mutationFn: async ({
      annotationId,
      text,
    }: {
      annotationId: string;
      text: string;
    }) => {
      const response = await fetch(
        `/api/content/${contentId}/annotations/${annotationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        }
      );
      if (!response.ok) throw new Error('Failed to update annotation');
      return response.json() as Promise<ContentAnnotation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] });
    },
  });

  // Delete annotation
  const deleteMutation = useMutation({
    mutationFn: async (annotationId: string) => {
      const response = await fetch(
        `/api/content/${contentId}/annotations/${annotationId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to delete annotation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', contentId] });
    },
  });

  return {
    annotations: annotations ?? [],
    isLoading,
    error,
    actions: {
      add: addMutation.mutate,
      update: updateMutation.mutate,
      delete: deleteMutation.mutate,
    },
  };
}
