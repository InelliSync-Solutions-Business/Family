import { useState, useEffect } from 'react';
import { TimelineEnhanced, TimelineItem } from '../timeline/TimelineEnhanced';
import { MediaPlayer } from './MediaPlayer';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDistance } from 'date-fns';

type MediaTimelineProps = {
  items: Array<TimelineItem & {
    mediaUrl?: string;
    mediaType?: 'video' | 'audio';
    thumbnailUrl?: string;
  }>;
};

export const MediaTimelineView = ({ items }: MediaTimelineProps) => {
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  // Group items by decade
  const groups = Array.from(
    new Set(
      items.map(item => {
        const year = new Date(item.start).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        return { id: decade.toString(), content: `${decade}s` };
      })
    )
  );

  // Add group information to items
  const itemsWithGroups = items.map(item => ({
    ...item,
    group: (Math.floor(new Date(item.start).getFullYear() / 10) * 10).toString(),
  }));

  return (
    <div className={`gap-6 ${isLargeScreen ? 'grid grid-cols-3' : 'space-y-6'}`}>
      {/* Timeline Section */}
      <div className={isLargeScreen ? 'col-span-2' : ''}>
        <TimelineEnhanced
          items={itemsWithGroups}
          groups={groups}
          onItemClick={(item) => {
            setSelectedItem(item);
            setIsPlaying(true);
          }}
        />
      </div>

      {/* Media Player Section */}
      <div className={isLargeScreen ? 'col-span-1' : ''}>
        <Card className="p-4">
          {selectedItem ? (
            <div className="space-y-4">
              <MediaPlayer
                src={selectedItem.mediaUrl || ''}
                type={selectedItem.mediaType || 'video'}
                autoPlay={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {selectedItem.content}
                </h3>
                {selectedItem.title && (
                  <p className="text-sm text-gray-600">
                    {selectedItem.title}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {formatDistance(
                    new Date(selectedItem.start),
                    new Date(),
                    { addSuffix: true }
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a media item from the timeline to play
            </div>
          )}
        </Card>

        {/* Thumbnails Section */}
        <ScrollArea className="h-48 mt-4">
          <div className="grid grid-cols-3 gap-2 p-2">
            {items
              .filter(item => item.thumbnailUrl)
              .map(item => (
                <button
                  key={item.id}
                  className={`relative aspect-video rounded-md overflow-hidden transition-all ${
                    selectedItem?.id === item.id
                      ? 'ring-2 ring-primary'
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsPlaying(true);
                  }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.content}
                    className="w-full h-full object-cover"
                  />
                  {item.mediaType === 'audio' && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V5l12 7-12 7z"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
