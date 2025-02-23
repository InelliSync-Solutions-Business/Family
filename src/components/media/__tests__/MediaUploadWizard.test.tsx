import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the MediaUploadWizard component for now
vi.mock('../MediaUploadWizard', () => ({
  MediaUploadWizard: ({ onClose, onComplete }: { onClose: () => void, onComplete: () => void }) => (
    <div>
      <h1>Upload Family Media</h1>
      <input type="file" aria-label="upload" />
      <input placeholder="Title" />
      <input placeholder="Add tag" />
      <button onClick={onComplete}>Continue</button>
    </div>
  ),
}));

describe('MediaUploadWizard', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onComplete: mockOnComplete,
  };

  it('renders upload step initially', () => {
    render(<MediaUploadWizard {...defaultProps} />);
    expect(screen.getByText('Upload Family Media')).toBeInTheDocument();
  });

  it('shows details step after successful upload', async () => {
    render(<MediaUploadWizard {...defaultProps} />);
    
    // Simulate file upload
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('validates required fields before proceeding', async () => {
    render(<MediaUploadWizard {...defaultProps} />);
    
    // Try to proceed without title
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('handles tag addition and removal', () => {
    render(<MediaUploadWizard {...defaultProps} />);
    
    // Add tag
    const tagInput = screen.getByPlaceholderText('Add tag');
    fireEvent.change(tagInput, { target: { value: 'family' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    
    expect(screen.getByText('family')).toBeInTheDocument();
    
    // Remove tag
    const tagBadge = screen.getByText('family');
    fireEvent.click(tagBadge);
    
    expect(screen.queryByText('family')).not.toBeInTheDocument();
  });
});
