import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the MediaDetailsModal component for now
vi.mock('../MediaDetailsModal', () => ({
  MediaDetailsModal: ({ media, onClose, onUpdate, onDelete }: {
    media: any,
    onClose: () => void,
    onUpdate: (media: any) => void,
    onDelete: (id: string) => void
  }) => (
    <div>
      <h1>{media.title}</h1>
      <p>{media.description}</p>
      {media.tags.map((tag: string) => (
        <span key={tag}>{tag}</span>
      ))}
      {media.people.map((person: string) => (
        <span key={person}>{person}</span>
      ))}
      <button onClick={() => onUpdate({ ...media, title: 'Updated Title' })}>Edit</button>
      <button onClick={() => onDelete(media.id)}>Delete</button>
    </div>
  ),
}));

describe('MediaDetailsModal', () => {
  const mockMedia = {
    id: '1',
    title: 'Test Video',
    description: 'Test Description',
    date: new Date(2024, 0, 1),
    mediaUrl: '/test.mp4',
    mediaType: 'video' as const,
    thumbnailUrl: '/thumbnail.jpg',
    tags: ['family', 'holiday'],
    people: ['Dad', 'Mom'],
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    media: mockMedia,
    open: true,
    onClose: mockOnClose,
    onUpdate: mockOnUpdate,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders media details correctly', () => {
    render(<MediaDetailsModal {...defaultProps} />);
    
    expect(screen.getByText(mockMedia.title)).toBeInTheDocument();
    expect(screen.getByText(mockMedia.description)).toBeInTheDocument();
    expect(screen.getByText('family')).toBeInTheDocument();
    expect(screen.getByText('Dad')).toBeInTheDocument();
  });

  it('switches to edit mode', () => {
    render(<MediaDetailsModal {...defaultProps} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue(mockMedia.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockMedia.description)).toBeInTheDocument();
  });

  it('handles media update', async () => {
    render(<MediaDetailsModal {...defaultProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Update title
    const titleInput = screen.getByDisplayValue(mockMedia.title);
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
        })
      );
    });
  });

  it('handles media deletion', async () => {
    render(<MediaDetailsModal {...defaultProps} />);
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockMedia.id);
    });
  });

  it('handles tag management', () => {
    render(<MediaDetailsModal {...defaultProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Add new tag
    const tagInput = screen.getByPlaceholderText('Add tag');
    fireEvent.change(tagInput, { target: { value: 'newtag' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    
    expect(screen.getByText('newtag')).toBeInTheDocument();
    
    // Remove existing tag
    const familyTag = screen.getByText('family');
    fireEvent.click(familyTag);
    
    expect(screen.queryByText('family')).not.toBeInTheDocument();
  });

  it('cancels edit mode without saving', () => {
    render(<MediaDetailsModal {...defaultProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Make some changes
    const titleInput = screen.getByDisplayValue(mockMedia.title);
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    // Cancel edit
    fireEvent.click(screen.getByText('Cancel'));
    
    // Original title should still be displayed
    expect(screen.getByText(mockMedia.title)).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});
