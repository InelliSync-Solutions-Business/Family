export type ContentType = 'image' | 'document' | 'pdf';

export interface ContentMetadata {
  title: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags?: string[];
  isPrivate: boolean;
  type: ContentType;
  fileUrl: string;
  thumbnailUrl?: string;
}

export interface ContentItem extends ContentMetadata {
  id: string;
  likes: number;
  commentCount: number;
  hasLiked?: boolean;
}

export interface ContentAnnotation {
  id: string;
  contentId: string;
  userId: string;
  text: string;
  createdAt: Date;
  position?: {
    x: number;
    y: number;
  };
}
