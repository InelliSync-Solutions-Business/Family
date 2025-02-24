import { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContentItem, ContentType } from '@/types/content';
import { useContent } from '@/hooks/use-content';
import { ContentCard } from './ContentCard';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Input } from '../../components/ui/input';

interface ContentGridProps {
  isPrivate?: boolean;
  onViewContent: (content: ContentItem) => void;
}

type SortOption = {
  label: string;
  value: keyof ContentItem;
  order: 'asc' | 'desc';
};

const sortOptions: SortOption[] = [
  { label: 'Most Recent', value: 'uploadedAt', order: 'desc' },
  { label: 'Oldest First', value: 'uploadedAt', order: 'asc' },
  { label: 'Most Liked', value: 'likes', order: 'desc' },
  { label: 'Most Comments', value: 'commentCount', order: 'desc' },
  { label: 'Title A-Z', value: 'title', order: 'asc' },
  { label: 'Title Z-A', value: 'title', order: 'desc' },
];

const contentTypes: ContentType[] = ['image', 'document', 'pdf'];

export function ContentGrid({ isPrivate, onViewContent }: ContentGridProps) {
  const { ref: infiniteRef, inView } = useInView();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  
  const {
    content,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    searchQuery,
    setSearchQuery,
    actions,
  } = useContent({
    isPrivate,
    pageSize: 12,
  });

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle search input with debounce
  const handleSearchInput = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading content. Please try again.
      </div>
    );
  }

  const sortedContent = [...content].sort((a, b) => {
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortBy.order === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortBy.order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortBy.order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchInput(e.target.value)}
          className="flex-1"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {contentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {sortBy.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={`${option.value}-${option.order}`}
                onClick={() => setSortBy(option)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {sortedContent.map((item: ContentItem) => (
          <motion.div key={item.id} variants={itemAnimation}>
            <ContentCard
              content={item}
              onView={onViewContent}
              onLike={() => actions.like(item.id)}
              onComment={() => onViewContent(item)}
              onShare={() => actions.share(item.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Loading States */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {!isLoading && hasNextPage && (
        <div ref={infiniteRef} className="h-1" />
      )}

      {/* Empty State */}
      {!isLoading && content.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No content found. Try adjusting your filters or upload something new!
        </div>
      )}
    </div>
  );
}
