import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Calendar } from '../../components/ui/calendar';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MediaPlayer } from './MediaPlayer';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface MediaDetails {
  id: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  mediaUrl: string;
  mediaType: 'video' | 'audio';
  thumbnailUrl: string;
  tags: string[];
  people: string[];
  transcription?: string;
}

interface MediaDetailsModalProps {
  media: MediaDetails;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: MediaDetails) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const MediaDetailsModal = ({
  media,
  open,
  onClose,
  onUpdate,
  onDelete,
}: MediaDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedMedia, setEditedMedia] = useState(media);
  const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'transcription'>('preview');
  const [newTag, setNewTag] = useState('');
  const [newPerson, setNewPerson] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(editedMedia);
      setIsEditing(false);
      toast.success('Changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(media.id);
      onClose();
      toast.success('Media deleted successfully');
    } catch (error) {
      toast.error('Failed to delete media');
      setIsDeleting(false);
    }
  };

  const handleTagAdd = () => {
    if (newTag && !editedMedia.tags.includes(newTag)) {
      setEditedMedia(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag('');
    }
  };

  const handlePersonAdd = () => {
    if (newPerson && !editedMedia.people.includes(newPerson)) {
      setEditedMedia(prev => ({
        ...prev,
        people: [...prev.people, newPerson],
      }));
      setNewPerson('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Media' : media.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {media.transcription && (
              <TabsTrigger value="transcription">Transcription</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <MediaPlayer
                src={media.mediaUrl}
                type={media.mediaType}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    placeholder="Title"
                    value={editedMedia.title}
                    onChange={(e) => setEditedMedia(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))}
                  />

                  <Textarea
                    placeholder="Description"
                    value={editedMedia.description}
                    onChange={(e) => setEditedMedia(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Calendar
                      mode="single"
                      selected={editedMedia.date}
                      onSelect={(date) => date && setEditedMedia(prev => ({
                        ...prev,
                        date,
                      }))}
                      className="rounded-md border"
                    />
                  </div>

                  <Input
                    placeholder="Location"
                    value={editedMedia.location}
                    onChange={(e) => setEditedMedia(prev => ({
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
                    <div className="flex flex-wrap gap-2">
                      {editedMedia.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => setEditedMedia(prev => ({
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
                    <div className="flex flex-wrap gap-2">
                      {editedMedia.people.map(person => (
                        <Badge
                          key={person}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => setEditedMedia(prev => ({
                            ...prev,
                            people: prev.people.filter(p => p !== person),
                          }))}
                        >
                          {person} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Title</h3>
                      <p className="text-gray-600">{media.title}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Date</h3>
                      <p className="text-gray-600">
                        {format(media.date, 'PP')}
                      </p>
                    </div>
                    {media.location && (
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-gray-600">{media.location}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">Type</h3>
                      <p className="text-gray-600 capitalize">
                        {media.mediaType}
                      </p>
                    </div>
                  </div>

                  {media.description && (
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-gray-600">{media.description}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {media.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">People</h3>
                    <div className="flex flex-wrap gap-2">
                      {media.people.map(person => (
                        <Badge key={person} variant="outline">
                          {person}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {media.transcription && (
            <TabsContent value="transcription" className="mt-4">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">
                  {media.transcription}
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditedMedia(media);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
