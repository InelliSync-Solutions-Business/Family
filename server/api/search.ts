import express from 'express';
import { chatCompletion } from '../../src/services/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/api';
import { ContentType } from '../../src/types/content';

const router = express.Router();
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

interface SearchQuery {
  query: string;
  contentType?: ContentType;
  contextId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

async function getEmbedding(text: string): Promise<number[]> {
  // Implement embedding generation using OpenAI's embedding API
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const result = await response.json();
  return result.data[0].embedding;
}

router.post('/search', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { query, contentType, contextId, timeRange, tags }: SearchQuery = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        status: 401,
      });
    }

    // 1. Generate search context
    const contextPrompt = [
      `Search query: "${query}"`,
      contextId && 'Consider this specific content item for context.',
      contentType && `Focus on ${contentType} content.`,
      tags?.length && `Related tags: ${tags.join(', ')}`,
      'Generate 3 semantic search variations for family history context.',
    ]
      .filter(Boolean)
      .join('\n');

    // 2. Query expansion using OpenAI
    const expandedQuery = await chatCompletion({
      messages: [{
        role: 'user',
        content: contextPrompt,
      }],
      maxTokens: 150,
      temperature: 0.7,
      model: 'gpt-4o-mini',
    });

    // 3. Get embeddings for expanded queries
    const queries = [query, ...expandedQuery.split('\n')]
      .filter(Boolean)
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const embeddings = await Promise.all(queries.map(q => getEmbedding(q)));

    // 4. Build Pinecone query filter
    const filter: Record<string, any> = {
      userId,
      isPrivate: false, // Only search shared content
    };

    if (contentType) {
      filter.contentType = contentType;
    }

    if (timeRange) {
      filter.timestamp = {
        $gte: timeRange.start.toISOString(),
        $lte: timeRange.end.toISOString(),
      };
    }

    if (tags?.length) {
      filter.tags = { $in: tags };
    }

    // 5. Perform vector search with context boost
    const index = pc.Index(process.env.PINECONE_INDEX!);
    
    // Search with each embedding and combine results
    const searchPromises = embeddings.map((vector, i) =>
      index.query({
        vector,
        filter,
        topK: i === 0 ? 10 : 5, // More results for primary query
        includeMetadata: true,
      })
    );

    const searchResults = await Promise.all(searchPromises);

    // 6. Merge and deduplicate results
    const seenIds = new Set<string>();
    const mergedResults = searchResults
      .flatMap(result => result.matches || [])
      .filter(match => {
        const id = match.metadata?.documentId as string || '';
        if (!id || seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);

    // 7. Format response
    const formattedResults = mergedResults.map(match => {
      const metadata = match.metadata as Record<string, string | string[]> | undefined;
      return {
        id: metadata?.documentId as string || '',
        title: metadata?.title as string || 'Untitled',
        type: metadata?.contentType as string || '',
        preview: metadata?.preview as string || '',
        tags: (metadata?.tags as string[]) || [],
        uploadedBy: metadata?.uploadedBy as string || '',
        uploadedAt: metadata?.uploadedAt as string || '',
        score: match.score || 0,
      };
    });

    res.json({
      results: formattedResults,
      metadata: {
        totalResults: formattedResults.length,
        expandedQueries: queries.slice(1), // Exclude original query
        appliedFilters: {
          contentType,
          timeRange,
          tags,
        },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      message: 'Search failed',
      code: 'SEARCH_ERROR',
      status: 500,
    });
  }
});

export default router;
