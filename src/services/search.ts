import { supabase } from '@/lib/supabaseClient';
import { SearchResult } from '@/types/api';

export async function searchDocuments(query: string): Promise<SearchResult[]> {
  try {
    // Perform a full-text search using Supabase's built-in search functionality
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .textSearch('content', query)
      .order('created_at', { ascending: false });

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
