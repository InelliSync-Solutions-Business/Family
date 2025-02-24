import { supabase } from '@/lib/supabaseClient';
import { SearchResult } from '@/types/api';

export interface SearchDocumentsParams {
  query: string;
  userId?: string;
}

export async function searchDocuments({ query, userId }: SearchDocumentsParams): Promise<SearchResult[]> {
  try {
    // Perform a full-text search using Supabase's built-in search functionality
    const baseQuery = supabase
      .from('documents')
      .select('*')
      .textSearch('content', query);

    // If userId is provided, filter by user's documents
    const finalQuery = userId 
      ? baseQuery.eq('user_id', userId)
      : baseQuery;

    const { data, error } = await finalQuery.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in search service:', error);
    return [];
  }
}
