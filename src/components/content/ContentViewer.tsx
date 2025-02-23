import { useState } from 'react';
import { X, Download, Plus } from 'lucide-react';
import { ContentItem, ContentAnnotation } from '@/types/content';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIChat } from '@/components/AIChat';
import { CommentSystem } from '@/components/CommentSystem';

interface ContentViewerProps {
  content: ContentItem | null;
  annotations: ContentAnnotation[];
  onClose: () => void;
  onAddAnnotation: (annotation: Omit<ContentAnnotation, 'id' | 'createdAt'>) => void;
  onDownload: (contentId: string) => void;
}

export function ContentViewer({
  content,
  annotations,
  onClose,
  onAddAnnotation,
  onDownload,
}: ContentViewerProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [isAnnotating, setIsAnnotating] = useState(false);

  if (!content) return null;

  const handleAnnotationClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const annotationText = window.prompt('Add your annotation:');
    if (annotationText) {
      onAddAnnotation({
        contentId: content.id,
        userId: 'current-user', // Replace with actual user ID
        text: annotationText,
        position: { x, y },
      });
    }

    setIsAnnotating(false);
  };

  return (
    <Dialog open={!!content} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{content.title}</DialogTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDownload(content.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsAnnotating(!isAnnotating)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="h-[calc(100%-2rem)] mt-2">
            <div 
              className="relative h-full overflow-auto"
              onClick={handleAnnotationClick}
            >
              {content.type === 'image' ? (
                <img
                  src={content.fileUrl}
                  alt={content.title}
                  className="w-full h-auto"
                />
              ) : (
                <iframe
                  src={content.fileUrl}
                  className="w-full h-full"
                  title={content.title}
                />
              )}

              {/* Annotations */}
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute w-4 h-4 bg-primary rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                  style={{
                    left: `${annotation.position?.x}%`,
                    top: `${annotation.position?.y}%`,
                  }}
                  title={annotation.text}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="h-[calc(100%-2rem)] mt-2">
            <CommentSystem contentId={content.id} />
          </TabsContent>

          <TabsContent value="ai" className="h-[calc(100%-2rem)] mt-2">
            <AIChat contentContext={content} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
