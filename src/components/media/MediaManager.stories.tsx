import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MediaTimelineView } from './MediaTimelineView';
import { MediaUploadWizard } from './MediaUploadWizard';
import { MediaSidebar } from './MediaSidebar';
import { MediaDetailsModal } from './MediaDetailsModal';
import { Button } from '../../components/ui/button';
import { Toaster } from 'sonner';
import { TimelineItem } from '../timeline/TimelineEnhanced';
import type { MediaDetails } from './MediaDetailsModal';

const meta = {
  title: 'Components/Media/MediaManager',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

const sampleTags = [
  'wedding', 'vacation', 'birthday', 'holiday',
  'family-event', 'interview', 'milestone',
];

const samplePeople = [
  'Grandma Sarah', 'Grandpa Joe', 'Aunt Mary',
  'Uncle Bob', 'Cousin Emma', 'Dad', 'Mom',
];

type MediaItem = TimelineItem & {
  title: string;
  description: string;
  date: Date;
  location?: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'audio';
  thumbnailUrl?: string;
  tags: string[];
  people: string[];
  transcription?: string;
};

const sampleItems: MediaItem[] = [
  {
    id: '1',
    title: 'Grandma\'s Wedding Video',
    description: 'The beautiful ceremony in Chicago, 1955',
    date: new Date(1955, 5, 15),
    location: 'Chicago, IL',
    content: 'Grandma\'s Wedding',
    start: new Date(1955, 5, 15),
    type: 'point',
    mediaUrl: '/sample/wedding-video.mp4',
    mediaType: 'video',
    thumbnailUrl: '/sample/wedding-thumbnail.jpg',
    tags: ['wedding', 'family-event'],
    people: ['Grandma Sarah', 'Grandpa Joe'],
  },
  {
    id: '2',
    title: 'Family Vacation in Italy',
    description: 'Summer vacation exploring Rome and Florence',
    date: new Date(1975, 7, 1),
    location: 'Rome, Italy',
    content: 'Italy Vacation',
    start: new Date(1975, 7, 1),
    end: new Date(1975, 7, 15),
    type: 'range',
    mediaUrl: '/sample/italy-vacation.mp4',
    mediaType: 'video',
    thumbnailUrl: '/sample/italy-thumbnail.jpg',
    tags: ['vacation', 'travel'],
    people: ['Dad', 'Mom', 'Aunt Mary'],
  },
  {
    id: '3',
    title: 'Grandpa\'s War Stories',
    description: 'Audio recording of memories from World War II',
    date: new Date(1980, 6, 4),
    content: 'War Stories',
    start: new Date(1980, 6, 4),
    type: 'point',
    mediaUrl: '/sample/war-stories.mp3',
    mediaType: 'audio',
    thumbnailUrl: '/sample/audio-waveform.png',
    tags: ['interview', 'history'],
    people: ['Grandpa Joe'],
    transcription: 'It was the summer of 1944 when our unit...',
  },
];

export const MediaManager = () => {
  const [items, setItems] = useState(sampleItems);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [filteredItems, setFilteredItems] = useState(items);

  const handleUploadComplete = (metadata: any) => {
    const newItem: MediaItem = {
      id: crypto.randomUUID(),
      content: metadata.title,
      start: metadata.date,
      type: 'point',
      ...metadata,
    };
    setItems(prev => [...prev, newItem]);
    setIsUploadOpen(false);
  };

  const handleItemUpdate = async (updated: any) => {
    setItems(prev =>
      prev.map(item =>
        item.id === updated.id ? updated : item
      )
    );
    setSelectedItem(null);
  };

  const handleItemDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItem(null);
  };

  return (
    <div className="flex h-screen bg-white">
      <MediaSidebar
        availableTags={sampleTags}
        availablePeople={samplePeople}
        onFiltersChange={(filters) => {
          let filtered = items;

          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(item =>
              item.title.toLowerCase().includes(search) ||
              item.description?.toLowerCase().includes(search)
            );
          }

          if (filters.dateRange?.from) {
            filtered = filtered.filter(item =>
              item.date >= filters.dateRange!.from!
            );
          }

          if (filters.dateRange?.to) {
            filtered = filtered.filter(item =>
              item.date <= filters.dateRange!.to!
            );
          }

          if (filters.mediaTypes.length) {
            filtered = filtered.filter(item =>
              item.mediaType && filters.mediaTypes.includes(item.mediaType)
            );
          }

          if (filters.tags.length) {
            filtered = filtered.filter(item =>
              filters.tags.some(tag => item.tags.includes(tag))
            );
          }

          if (filters.people.length) {
            filtered = filtered.filter(item =>
              filters.people.some(person => item.people.includes(person))
            );
          }

          setFilteredItems(filtered);
        }}
      />

      <div className="flex-1 overflow-hidden">
        <div className="h-16 border-b flex items-center justify-between px-6">
          <h1 className="text-2xl font-semibold">Family Media Archive</h1>
          <Button onClick={() => setIsUploadOpen(true)}>
            Upload Media
          </Button>
        </div>

        <div className="p-6 overflow-auto h-[calc(100vh-4rem)]">
          <MediaTimelineView
            items={filteredItems}
          />
        </div>
      </div>

      <MediaUploadWizard
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onComplete={handleUploadComplete}
      />

      {selectedItem && selectedItem.mediaUrl && selectedItem.mediaType && selectedItem.thumbnailUrl && (
        <MediaDetailsModal
          media={selectedItem as MediaDetails}
          open={true}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleItemUpdate}
          onDelete={handleItemDelete}
        />
      )}

      <Toaster />
    </div>
  );
};
