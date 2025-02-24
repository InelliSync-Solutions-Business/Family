import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { MediaUpload } from './MediaUpload';
import { ThumbnailService } from '@/services/thumbnailService';
import { MediaProcessingService } from '@/services/mediaProcessing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar } from '../../components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

type WizardStep = 'upload' | 'details' | 'preview' | 'processing';

interface MediaMetadata {
  title: string;
  description: string;
  date: Date;
  location?: string;
  tags: string[];
  people: string[];
}

export const MediaUploadWizard = ({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (metadata: MediaMetadata & { mediaUrl: string; thumbnailUrl: string }) => void;
}) => {
  const [step, setStep] = useState<WizardStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: 'video' | 'audio' }>();
  const [metadata, setMetadata] = useState<MediaMetadata>({
    title: '',
    description: '',
    date: new Date(),
    tags: [],
    people: [],
  });
  const [processing, setProcessing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newPerson, setNewPerson] = useState('');

  const handleUploadComplete = async (url: string, type: 'video' | 'audio') => {
    setUploadedFile({ url, type });
    setStep('details');
  };

  const handleTagAdd = () => {
    if (newTag && !metadata.tags.includes(newTag)) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag('');
    }
  };

  const handlePersonAdd = () => {
    if (newPerson && !metadata.people.includes(newPerson)) {
      setMetadata(prev => ({
        ...prev,
        people: [...prev.people, newPerson],
      }));
      setNewPerson('');
    }
  };

  const handleProcessing = async () => {
    if (!uploadedFile) return;

    setStep('processing');
    setProcessing(true);

    try {
      // Generate thumbnail
      const thumbnailService = ThumbnailService.getInstance();
      const thumbnailUrl = await (uploadedFile.type === 'video'
        ? thumbnailService.generateVideoThumbnail(uploadedFile.url)
        : thumbnailService.generateAudioWaveform(uploadedFile.url));

      // Process media (transcription, etc.)
      const mediaService = new MediaProcessingService();
      await mediaService.processMedia({
        title: metadata.title,
        description: metadata.description,
        mediaType: uploadedFile.type,
        storagePath: uploadedFile.url,
      });

      onComplete({
        ...metadata,
        mediaUrl: uploadedFile.url,
        thumbnailUrl,
      });

      toast.success('Media uploaded and processed successfully!');
      onClose();
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Error processing media');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Family Media</DialogTitle>
        </DialogHeader>

        <Tabs value={step} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" disabled={step !== 'upload'}>
              Upload
            </TabsTrigger>
            <TabsTrigger value="details" disabled={step !== 'details'}>
              Details
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={step !== 'preview'}>
              Preview
            </TabsTrigger>
            <TabsTrigger value="processing" disabled={step !== 'processing'}>
              Processing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <MediaUpload
              onUploadComplete={handleUploadComplete}
              onError={(error) => toast.error(error)}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            <Input
              placeholder="Title"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({
                ...prev,
                title: e.target.value,
              }))}
            />

            <Textarea
              placeholder="Description"
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({
                ...prev,
                description: e.target.value,
              }))}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Calendar
                mode="single"
                selected={metadata.date}
                onSelect={(date) => date && setMetadata(prev => ({
                  ...prev,
                  date,
                }))}
              />
            </div>

            <Input
              placeholder="Location"
              value={metadata.location}
              onChange={(e) => setMetadata(prev => ({
                ...prev,
                location: e.target.value,
              }))}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTagAdd()}
                />
                <Button onClick={handleTagAdd}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {metadata.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setMetadata(prev => ({
                      ...prev,
                      tags: prev.tags.filter(t => t !== tag),
                    }))}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">People</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add person"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePersonAdd()}
                />
                <Button onClick={handlePersonAdd}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {metadata.people.map(person => (
                  <Badge
                    key={person}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setMetadata(prev => ({
                      ...prev,
                      people: prev.people.filter(p => p !== person),
                    }))}
                  >
                    {person} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button
                onClick={() => setStep('preview')}
                disabled={!metadata.title || !metadata.date}
              >
                Continue
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="space-y-4">
              {uploadedFile && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {uploadedFile.type === 'video' ? (
                    <video
                      src={uploadedFile.url}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                    <audio
                      src={uploadedFile.url}
                      controls
                      className="w-full mt-20"
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Title</h3>
                  <p className="text-gray-600">{metadata.title}</p>
                </div>
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p className="text-gray-600">
                    {format(metadata.date, 'PP')}
                  </p>
                </div>
                {metadata.location && (
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600">{metadata.location}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">Type</h3>
                  <p className="text-gray-600 capitalize">
                    {uploadedFile?.type}
                  </p>
                </div>
              </div>

              {metadata.description && (
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-gray-600">{metadata.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {metadata.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {metadata.people.map(person => (
                  <Badge key={person} variant="outline">{person}</Badge>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button onClick={handleProcessing}>
                  Process Media
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="processing" className="mt-4">
            <div className="text-center py-8">
              {processing ? (
                <>
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">
                    Processing your media...
                  </p>
                </>
              ) : (
                <p className="text-gray-600">
                  Processing complete!
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
