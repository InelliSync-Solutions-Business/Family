import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ContentItem } from '@/types/content';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../ui/button';

interface ContentCardProps {
  content: ContentItem;
  onView: (content: ContentItem) => void;
  onLike: (contentId: string) => void;
  onComment: (contentId: string) => void;
  onShare: (contentId: string) => void;
}

export function ContentCard({ content, onView, onLike, onComment, onShare }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`/avatars/${content.uploadedBy}.jpg`} />
              <AvatarFallback>{content.uploadedBy[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{content.title}</h3>
              <p className="text-sm text-muted-foreground">
                Uploaded by {content.uploadedBy} • {format(content.uploadedAt, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent 
          className="relative cursor-pointer" 
          onClick={() => onView(content)}
        >
          {content.type === 'image' ? (
            <img
              src={content.thumbnailUrl || content.fileUrl}
              alt={content.title}
              className="w-full h-48 object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
          )}
          
          {content.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {content.description}
            </p>
          )}

          {content.tags && content.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between py-4">
          <div className="flex space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={content.hasLiked ? 'text-red-500' : ''}
                  onClick={() => onLike(content.id)}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {content.likes}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Like this content</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComment(content.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {content.commentCount}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Comment on this content</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(content)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>

            {!content.isPrivate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare(content.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share with family</TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
