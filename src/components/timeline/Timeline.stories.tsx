import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, TimelineItem } from './Timeline';

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: TimelineItem[] = [
  {
    id: '1',
    content: 'Grandma\'s Wedding',
    start: new Date(1955, 5, 15),
    type: 'point',
    title: 'Wedding ceremony in Chicago',
  },
  {
    id: '2',
    content: 'Family Vacation in Italy',
    start: new Date(1975, 7, 1),
    end: new Date(1975, 7, 15),
    type: 'range',
    title: 'Summer vacation in Rome and Florence',
  },
  {
    id: '3',
    content: 'First Family Reunion',
    start: new Date(1980, 6, 4),
    type: 'point',
    title: 'Independence Day celebration',
  },
  {
    id: '4',
    content: 'Moving to California',
    start: new Date(1985, 2, 10),
    type: 'point',
    title: 'Family relocated to San Francisco',
  },
  {
    id: '5',
    content: '50th Anniversary Celebration',
    start: new Date(2005, 5, 15),
    type: 'point',
    title: 'Golden anniversary party',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    onItemClick: (item) => console.log('Clicked item:', item),
    onRangeChange: (start, end) => 
      console.log('Range changed:', { start, end }),
  },
};

export const WithCustomStyles: Story = {
  args: {
    ...Default.args,
    items: sampleItems.map(item => ({
      ...item,
      className: 'custom-timeline-item',
    })),
  },
  decorators: [
    (Story) => (
      <div className="w-[1200px] p-8 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-6">Family Timeline</h2>
        <Story />
      </div>
    ),
  ],
};
