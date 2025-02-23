import type { Meta, StoryObj } from '@storybook/react';
import { MediaPlayer } from './MediaPlayer';
import { useMediaAnnotations } from '@/hooks/useMediaAnnotations';

const meta = {
  title: 'Components/Media/MediaPlayer',
  component: MediaPlayer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MediaPlayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const VideoWithAnnotations = () => {
  const { annotations, addAnnotation } = useMediaAnnotations([
    { time: 2.5, text: 'Grandma\'s famous apple pie recipe', id: '1' },
    { time: 5.1, text: 'Family reunion 1992', id: '2' },
  ]);

  return (
    <div className="w-[800px]">
      <MediaPlayer
        src="/sample-family-video.mp4"
        type="video"
        annotations={annotations}
      />
    </div>
  );
};

export const AudioPlayer = () => (
  <div className="w-[600px]">
    <MediaPlayer
      src="/family-interview-1985.mp3"
      type="audio"
    />
  </div>
);
