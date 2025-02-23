import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the MediaSidebar component for now
vi.mock('../MediaSidebar', () => ({
  MediaSidebar: ({ onFiltersChange }: { onFiltersChange: (filters: any) => void }) => (
    <div>
      <h2>Search</h2>
      <input placeholder="Search media..." />
      <h2>Date Range</h2>
      <h2>Media Type</h2>
      <input type="checkbox" aria-label="Videos" />
      <h2>Tags</h2>
      <input aria-label="wedding" type="checkbox" />
      <button>Clear All Filters</button>
    </div>
  ),
}));

describe('MediaSidebar', () => {
  const mockOnFiltersChange = vi.fn();
  
  const defaultProps = {
    availableTags: ['wedding', 'vacation', 'birthday'],
    availablePeople: ['Grandma', 'Grandpa', 'Dad'],
    onFiltersChange: mockOnFiltersChange,
  };

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('renders all filter sections', () => {
    render(<MediaSidebar {...defaultProps} />);
    
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Media Type')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
  });

  it('triggers filter change on search input', () => {
    render(<MediaSidebar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search media...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test' })
    );
  });

  it('toggles media type filters', () => {
    render(<MediaSidebar {...defaultProps} />);
    
    const videoSwitch = screen.getByLabelText('Videos');
    fireEvent.click(videoSwitch);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaTypes: expect.not.arrayContaining(['video'])
      })
    );
  });

  it('handles tag selection', () => {
    render(<MediaSidebar {...defaultProps} />);
    
    const weddingTag = screen.getByLabelText('wedding');
    fireEvent.click(weddingTag);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: expect.arrayContaining(['wedding'])
      })
    );
  });

  it('clears all filters', () => {
    render(<MediaSidebar {...defaultProps} />);
    
    // Set some filters first
    const searchInput = screen.getByPlaceholderText('Search media...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: '',
        tags: [],
        people: [],
        mediaTypes: ['video', 'audio'],
      })
    );
  });
});
