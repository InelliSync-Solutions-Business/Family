import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { analytics } from '@/services/analytics';

// Default stale time for queries (5 minutes)
const DEFAULT_STALE_TIME = 1000 * 60 * 5;

// Default cache time for queries (30 minutes)
const DEFAULT_CACHE_TIME = 1000 * 60 * 30;

const handleError = (error: any) => {
  toast.error('An error occurred', {
    description: error?.message || 'Please try again later',
  });

  // Track error in analytics
  analytics.trackError(error, {
    type: 'query_error',
    timestamp: new Date().toISOString(),
  });
};

// Create a client
export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleError
    }),
    mutationCache: new MutationCache({
      onError: handleError
    }),
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_CACHE_TIME,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry on 404s or auth errors
          if (error?.response?.status === 404) return false;
          if (error?.response?.status === 401) return false;
          if (error?.response?.status === 403) return false;
          return failureCount < 3;
        }
      },
      mutations: {
        retry: 2
      }
    }
  });
}
