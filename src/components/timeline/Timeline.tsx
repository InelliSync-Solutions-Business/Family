import { useEffect, useRef } from 'react';
import { Timeline as VisTimeline, TimelineOptions } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

export type TimelineItem = {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  type?: 'box' | 'point' | 'range';
  title?: string;
  className?: string;
};

type TimelineProps = {
  items: TimelineItem[];
  onItemClick?: (item: TimelineItem) => void;
  onRangeChange?: (start: Date, end: Date) => void;
};

export const Timeline = ({ 
  items,
  onItemClick,
  onRangeChange,
}: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<VisTimeline | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    const container = timelineRef.current;
    const dataset = new DataSet(items.map(item => ({
      ...item,
      className: `timeline-item ${item.className || ''}`,
    })));

    const options: TimelineOptions = {
      height: '400px',
      min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      zoomMin: 1000 * 60 * 60 * 24 * 7, // one week
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 2, // about two years
      orientation: 'bottom',
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
    };

    timelineInstance.current = new VisTimeline(container, dataset, options);

    if (onItemClick) {
      timelineInstance.current.on('click', (properties) => {
        const item = items.find(i => i.id === properties.item);
        if (item) onItemClick(item);
      });
    }

    if (onRangeChange) {
      timelineInstance.current.on('rangechanged', (properties) => {
        onRangeChange(properties.start, properties.end);
      });
    }

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
      }
    };
  }, [items, onItemClick, onRangeChange]);

  return (
    <div className="w-full border rounded-lg shadow-sm bg-white">
      <div ref={timelineRef} className="timeline-container" />
    </div>
  );
};
