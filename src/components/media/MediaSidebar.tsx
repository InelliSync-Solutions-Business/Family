import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Calendar } from '../../components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { DateRange } from 'react-day-picker';

interface FilterState {
  search: string;
  dateRange: DateRange | undefined;
  mediaTypes: ('video' | 'audio')[];
  tags: string[];
  people: string[];
}

interface MediaSidebarProps {
  availableTags: string[];
  availablePeople: string[];
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export const MediaSidebar = ({
  availableTags,
  availablePeople,
  onFiltersChange,
  className = '',
}: MediaSidebarProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: undefined,
    mediaTypes: ['video', 'audio'],
    tags: [],
    people: [],
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleMediaType = (type: 'video' | 'audio') => {
    const newTypes = filters.mediaTypes.includes(type)
      ? filters.mediaTypes.filter(t => t !== type)
      : [...filters.mediaTypes, type];
    updateFilters({ mediaTypes: newTypes });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const togglePerson = (person: string) => {
    const newPeople = filters.people.includes(person)
      ? filters.people.filter(p => p !== person)
      : [...filters.people, person];
    updateFilters({ people: newPeople });
  };

  return (
    <div className={`w-80 border-r bg-gray-50/40 p-6 ${className}`}>
      <div className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search media..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        <Accordion type="multiple" defaultValue={['date', 'type', 'tags', 'people']}>
          {/* Date Range */}
          <AccordionItem value="date">
            <AccordionTrigger>Date Range</AccordionTrigger>
            <AccordionContent>
              <Calendar
                mode="range"
                selected={filters.dateRange}
                onSelect={(range) => updateFilters({ dateRange: range })}
                className="rounded-md border"
              />
              {filters.dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ dateRange: undefined })}
                  className="mt-2"
                >
                  Clear Dates
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Media Types */}
          <AccordionItem value="type">
            <AccordionTrigger>Media Type</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.mediaTypes.includes('video')}
                    onCheckedChange={() => toggleMediaType('video')}
                  />
                  <Label>Videos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.mediaTypes.includes('audio')}
                    onCheckedChange={() => toggleMediaType('audio')}
                  />
                  <Label>Audio</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tags */}
          <AccordionItem value="tags">
            <AccordionTrigger>Tags</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {availableTags.map(tag => (
                    <div
                      key={tag}
                      className="flex items-center space-x-2"
                    >
                      <Switch
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <Label>{tag}</Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          {/* People */}
          <AccordionItem value="people">
            <AccordionTrigger>People</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {availablePeople.map(person => (
                    <div
                      key={person}
                      className="flex items-center space-x-2"
                    >
                      <Switch
                        checked={filters.people.includes(person)}
                        onCheckedChange={() => togglePerson(person)}
                      />
                      <Label>{person}</Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.people.length > 0) && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
              {filters.people.map(person => (
                <Badge
                  key={person}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => togglePerson(person)}
                >
                  {person} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => updateFilters({
            search: '',
            dateRange: undefined,
            mediaTypes: ['video', 'audio'],
            tags: [],
            people: [],
          })}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};
