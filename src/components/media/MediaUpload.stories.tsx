import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { MediaUpload } from './MediaUpload';
import { Toaster } from 'sonner';

const meta = {
  title: 'Components/Media/MediaUpload',
  component: MediaUpload,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story: StoryFn) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof MediaUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onUploadComplete: (url: string, type: 'video' | 'audio') => {
      console.log('Upload completed:', { url, type });
    },
    onError: (error: string) => {
      console.error('Upload error:', error);
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story: StoryFn) => (
      <div className="max-w-xl mx-auto bg-gray-50 p-8 rounded-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Upload Family Media
        </h2>
        <Story />
        <Toaster />
      </div>
    ),
  ],
};
