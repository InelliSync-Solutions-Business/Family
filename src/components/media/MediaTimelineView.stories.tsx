import type { Meta, StoryObj } from '@storybook/react';
import { MediaTimelineView } from './MediaTimelineView';

const meta = {
  title: 'Components/Media/MediaTimelineView',
  component: MediaTimelineView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MediaTimelineView>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  {
    id: '1',
    content: 'Grandma\'s Wedding Video',
    start: new Date(1955, 5, 15),
    type: 'point',
    title: 'Wedding ceremony in Chicago',
    mediaUrl: '/sample/wedding-video.mp4',
    mediaType: 'video' as const,
    thumbnailUrl: '/sample/wedding-thumbnail.jpg',
    tags: ['wedding', 'family-event'],
  },
  {
    id: '2',
    content: 'Family Vacation in Italy',
    start: new Date(1975, 7, 1),
    end: new Date(1975, 7, 15),
    type: 'range',
    title: 'Summer vacation in Rome and Florence',
    mediaUrl: '/sample/italy-vacation.mp4',
    mediaType: 'video' as const,
    thumbnailUrl: '/sample/italy-thumbnail.jpg',
    tags: ['vacation', 'travel'],
  },
  {
    id: '3',
    content: 'Grandpa\'s War Stories',
    start: new Date(1980, 6, 4),
    type: 'point',
    title: 'Audio recording of war memories',
    mediaUrl: '/sample/war-stories.mp3',
    mediaType: 'audio' as const,
    thumbnailUrl: '/sample/audio-waveform.png',
    tags: ['interview', 'history'],
  },
  {
    id: '4',
    content: 'Moving to California',
    start: new Date(1985, 2, 10),
    type: 'point',
    title: 'Family relocated to San Francisco',
    mediaUrl: '/sample/california-move.mp4',
    mediaType: 'video' as const,
    thumbnailUrl: '/sample/california-thumbnail.jpg',
    tags: ['family-event', 'milestone'],
  },
  {
    id: '5',
    content: '50th Anniversary Interview',
    start: new Date(2005, 5, 15),
    type: 'point',
    title: 'Golden anniversary celebration',
    mediaUrl: '/sample/anniversary-interview.mp3',
    mediaType: 'audio' as const,
    thumbnailUrl: '/sample/anniversary-waveform.png',
    tags: ['interview', 'anniversary'],
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const WithFilters: Story = {
  args: {
    items: sampleItems,
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Family Media Timeline</h1>
          <Story />
        </div>
      </div>
    ),
  ],
};
