import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { AuthenticatedRequest, ContentQuery } from '../types/api';
import { ContentItem, ContentAnnotation } from '../../src/types/content';
import pineconeService from '../services/pinecone';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// In-memory storage (replace with database in production)
let contents: ContentItem[] = [];
let annotations: ContentAnnotation[] = [];

// Get content list with pagination and filters
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      cursor,
      limit = '12',
      isPrivate,
      type,
      tags,
      search,
    } = req.query as ContentQuery;

    let filteredContent = [...contents];

    // Apply filters
    if (isPrivate !== undefined) {
      filteredContent = filteredContent.filter(
        (c) => c.isPrivate === (isPrivate === 'true')
      );
    }

    if (type) {
      filteredContent = filteredContent.filter((c) => c.type === type);
    }

    if (tags) {
      const tagList = tags.split(',');
      filteredContent = filteredContent.filter((c) =>
        c.tags?.some((t) => tagList.includes(t))
      );
    }

    if (search) {
      // If search query exists, use Pinecone for semantic search
      const searchResults = await pineconeService.search(search);
      const contentIds = searchResults.map(r => r.id);
      filteredContent = filteredContent.filter(c => contentIds.includes(c.id));
    }

    // Handle pagination
    const startIndex = cursor ? contents.findIndex((c) => c.id === cursor) + 1 : 0;
    const paginatedContent = filteredContent.slice(
      startIndex,
      startIndex + parseInt(limit)
    );

    const nextCursor =
      startIndex + parseInt(limit) < filteredContent.length
        ? filteredContent[startIndex + parseInt(limit) - 1].id
        : undefined;

    res.json({
      items: paginatedContent,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      message: 'Failed to fetch content',
      code: 'FETCH_ERROR',
      status: 500,
    });
  }
});

// Upload new content
router.post(
  '/',
  authenticateToken,
  requirePermission('create', 'content'),
  upload.single('file'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file || !req.user) {
        return res.status(400).json({
          message: 'No file uploaded',
          code: 'NO_FILE',
          status: 400,
        });
      }

      const {
        title,
        description,
        isPrivate,
        type,
        tags: tagsString,
      } = req.body;

      const tags = tagsString ? tagsString.split(',') : [];
      const id = uuidv4();
      const fileName = `${id}-${req.file.originalname}`;

      // Process image if it's an image file
      if (type === 'image') {
        const processedImage = await sharp(req.file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Save the processed image (implement your storage solution)
        // For now, we'll just pretend we saved it
      }

      // Create content item
      const newContent: ContentItem = {
        id,
        title,
        description,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
        type,
        isPrivate: isPrivate === 'true',
        tags,
        fileUrl: `/uploads/${fileName}`,
        thumbnailUrl: type === 'image' ? `/uploads/thumb_${fileName}` : undefined,
        likes: 0,
        commentCount: 0,
      };

      contents.push(newContent);

      // If content is shared, index it in Pinecone
      if (!newContent.isPrivate) {
        try {
          // Create a searchable text that combines all relevant content information
          const searchableText = [
            newContent.title,
            newContent.description,
            ...(newContent.tags || [])
          ].filter(Boolean).join(' ');

          // Index the content with metadata
          await pineconeService.indexContent(
            newContent.id,
            searchableText,
            {
              title: newContent.title,
              type: newContent.type,
              tags: newContent.tags,
              uploadedBy: newContent.uploadedBy,
              uploadedAt: newContent.uploadedAt.toISOString()
            }
          );
        } catch (error) {
          console.error('Error indexing content:', error);
          // Don't fail the upload if indexing fails
        }
      }

      res.status(201).json(newContent);
    } catch (error) {
      console.error('Error uploading content:', error);
      res.status(500).json({
        message: 'Failed to upload content',
        code: 'UPLOAD_ERROR',
        status: 500,
      });
    }
  }
);

// Get content annotations
router.get(
  '/:contentId/annotations',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { contentId } = req.params;
      const contentAnnotations = annotations.filter(
        (a) => a.contentId === contentId
      );
      res.json(contentAnnotations);
    } catch (error) {
      console.error('Error fetching annotations:', error);
      res.status(500).json({
        message: 'Failed to fetch annotations',
        code: 'FETCH_ERROR',
        status: 500,
      });
    }
  }
);

// Add annotation
router.post(
  '/:contentId/annotations',
  authenticateToken,
  requirePermission('create', 'annotation'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) throw new Error('User not found');

      const { contentId } = req.params;
      const { text, position } = req.body;

      const newAnnotation: ContentAnnotation = {
        id: uuidv4(),
        contentId,
        userId: req.user.id,
        text,
        position,
        createdAt: new Date(),
      };

      annotations.push(newAnnotation);

      // Update the content's searchable text with the new annotation
      const content = contents.find(c => c.id === contentId);
      if (content && !content.isPrivate) {
        try {
          const searchableText = [
            content.title,
            content.description,
            ...(content.tags || []),
            text // Add the annotation text
          ].filter(Boolean).join(' ');

          // Re-index the content with updated text
          await pineconeService.indexContent(
            content.id,
            searchableText,
            {
              title: content.title,
              type: content.type,
              tags: content.tags,
              uploadedBy: content.uploadedBy,
              uploadedAt: content.uploadedAt.toISOString(),
              annotationCount: annotations.filter(a => a.contentId === contentId).length
            }
          );
        } catch (error) {
          console.error('Error updating content index:', error);
          // Don't fail the annotation if indexing fails
        }
      }

      res.status(201).json(newAnnotation);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to create annotation',
        code: 'CREATE_ERROR',
        status: 500,
      });
    }
  }
);

// Like content
router.post(
  '/:contentId/like',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { contentId } = req.params;
      const content = contents.find((c) => c.id === contentId);

      if (!content) {
        return res.status(404).json({
          message: 'Content not found',
          code: 'NOT_FOUND',
          status: 404,
        });
      }

      content.likes += 1;
      res.json({ likes: content.likes });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to like content',
        code: 'LIKE_ERROR',
        status: 500,
      });
    }
  }
);

export default router;
