import type { Meta, StoryObj } from '@storybook/react';
import { ContentCard } from './ContentCard';

const meta = {
  title: 'Components/Content/ContentCard',
  component: ContentCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockContent = {
  id: '1',
  title: 'Family Reunion 2024',
  description: 'Annual family gathering at Grandma\'s house',
  uploadedBy: 'John Doe',
  uploadedAt: new Date('2024-01-15'),
  type: 'image' as const,
  isPrivate: false,
  fileUrl: 'https://picsum.photos/800/600',
  thumbnailUrl: 'https://picsum.photos/400/300',
  likes: 12,
  commentCount: 5,
  tags: ['family', 'reunion', '2024'],
  hasLiked: false,
};

export const Default: Story = {
  args: {
    content: mockContent,
    onView: () => console.log('View clicked'),
    onLike: () => console.log('Like clicked'),
    onComment: () => console.log('Comment clicked'),
    onShare: () => console.log('Share clicked'),
  },
};

export const Liked: Story = {
  args: {
    content: {
      ...mockContent,
      hasLiked: true,
      likes: 13,
    },
    onView: () => console.log('View clicked'),
    onLike: () => console.log('Like clicked'),
    onComment: () => console.log('Comment clicked'),
    onShare: () => console.log('Share clicked'),
  },
};

export const Private: Story = {
  args: {
    content: {
      ...mockContent,
      isPrivate: true,
      title: 'Private Memory',
      description: 'This is a private memory only visible to me',
    },
    onView: () => console.log('View clicked'),
    onLike: () => console.log('Like clicked'),
    onComment: () => console.log('Comment clicked'),
    onShare: () => console.log('Share clicked'),
  },
};

export const Document: Story = {
  args: {
    content: {
      ...mockContent,
      type: 'document' as const,
      title: 'Family Recipe Book',
      description: 'Collection of traditional family recipes',
      fileUrl: '/documents/recipe-book.pdf',
      thumbnailUrl: undefined,
    },
    onView: () => console.log('View clicked'),
    onLike: () => console.log('Like clicked'),
    onComment: () => console.log('Comment clicked'),
    onShare: () => console.log('Share clicked'),
  },
};

export const LongContent: Story = {
  args: {
    content: {
      ...mockContent,
      title: 'This is a very long title that should be truncated when it exceeds the available space in the card',
      description: 'This is a very long description that should be truncated when it exceeds the available space. It contains multiple sentences and should demonstrate how the component handles overflow text in a graceful manner.',
      tags: ['family', 'reunion', '2024', 'memories', 'tradition', 'gathering', 'celebration'],
    },
    onView: () => console.log('View clicked'),
    onLike: () => console.log('Like clicked'),
    onComment: () => console.log('Comment clicked'),
    onShare: () => console.log('Share clicked'),
  },
};
