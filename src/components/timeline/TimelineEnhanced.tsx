import { useEffect, useRef, useState } from 'react';
import { Timeline as VisTimeline, TimelineOptions } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

export type TimelineGroup = {
  id: string;
  content: string;
  subgroupOrder?: 'ascending' | 'descending';
};

export type TimelineItem = {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  group?: string;
  subgroup?: string;
  type?: 'box' | 'point' | 'range' | 'background';
  title?: string;
  className?: string;
  editable?: boolean;
  tags?: string[];
};

type TimelineProps = {
  items: TimelineItem[];
  groups?: TimelineGroup[];
  onItemClick?: (item: TimelineItem) => void;
  onRangeChange?: (start: Date, end: Date) => void;
  onItemUpdate?: (item: TimelineItem) => void;
};

export const TimelineEnhanced = ({
  items,
  groups = [],
  onItemClick,
  onRangeChange,
  onItemUpdate,
}: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<VisTimeline | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [timelineView, setTimelineView] = useState<'year' | 'month' | 'day'>('year');

  // Get unique tags from items
  const availableTags = Array.from(
    new Set(items.flatMap(item => item.tags || []))
  );

  // Filter items based on search term and tag
  useEffect(() => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTag) {
      filtered = filtered.filter(item =>
        item.tags?.includes(filterTag)
      );
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, filterTag]);

  // Initialize and update timeline
  useEffect(() => {
    if (!timelineRef.current) return;

    const container = timelineRef.current;
    const dataset = new DataSet(filteredItems.map(item => ({
      ...item,
      className: `timeline-item ${item.className || ''}`,
    })));

    const groupset = new DataSet(groups);

    const options: TimelineOptions = {
      height: '400px',
      min: new Date(1900, 0, 1),
      max: new Date(2050, 0, 1),
      zoomMin: 1000 * 60 * 60 * 24 * 30, // One month
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 150, // 150 years
      orientation: 'top',
      showCurrentTime: true,
      stack: true,
      stackSubgroups: true,
      verticalScroll: true,
      horizontalScroll: true,
      zoomKey: 'ctrlKey',
      type: 'box' as const,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap',
      },
      editable: {
        updateTime: true,
        updateGroup: true,
      },
      groupOrder: 'content',
    };

    if (timelineInstance.current) {
      timelineInstance.current.destroy();
    }

    timelineInstance.current = new VisTimeline(
      container,
      dataset,
      groupset,
      options
    );

    if (onItemClick) {
      timelineInstance.current.on('click', (properties) => {
        const item = filteredItems.find(i => i.id === properties.item);
        if (item) onItemClick(item);
      });
    }

    if (onRangeChange) {
      timelineInstance.current.on('rangechanged', (properties) => {
        onRangeChange(properties.start, properties.end);
      });
    }

    if (onItemUpdate) {
      timelineInstance.current.on('change', (properties) => {
        const updatedItems = dataset.get(properties.items[0]);
        const updatedItem = Array.isArray(updatedItems) ? updatedItems[0] : updatedItems;
        if (updatedItem) {
          const timelineItem: TimelineItem = {
            id: updatedItem.id,
            content: updatedItem.content,
            start: updatedItem.start,
            end: updatedItem.end,
            group: updatedItem.group,
            subgroup: updatedItem.subgroup,
            type: updatedItem.type,
            title: updatedItem.title,
            className: updatedItem.className,
            editable: updatedItem.editable,
            tags: updatedItem.tags,
          };
          onItemUpdate(timelineItem);
        }
      });
    }

    // Set initial view
    const now = new Date();
    let start: Date, end: Date;
    switch (timelineView) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        break;
      default: // year
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 0);
    }
    timelineInstance.current.setWindow(start, end);

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
      }
    };
  }, [filteredItems, groups, onItemClick, onRangeChange, onItemUpdate, timelineView]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          type="search"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tags</SelectItem>
            {availableTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          <Button
            variant={timelineView === 'year' ? 'default' : 'outline'}
            onClick={() => setTimelineView('year')}
          >
            Year
          </Button>
          <Button
            variant={timelineView === 'month' ? 'default' : 'outline'}
            onClick={() => setTimelineView('month')}
          >
            Month
          </Button>
          <Button
            variant={timelineView === 'day' ? 'default' : 'outline'}
            onClick={() => setTimelineView('day')}
          >
            Day
          </Button>
        </div>
      </div>

      <div className="w-full border rounded-lg shadow-sm bg-white">
        <div ref={timelineRef} className="timeline-container" />
      </div>

      <div className="text-sm text-gray-500">
        {filteredItems.length} events shown
        {searchTerm && ` (filtered from ${items.length})`}
      </div>
    </div>
  );
};
