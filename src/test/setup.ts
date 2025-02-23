import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ShadCN UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ ...props }) => <input {...props} />,
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ ...props }) => <input type="checkbox" {...props} />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      }),
    },
    from: () => ({
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }),
  }),
}));

// Mock FFmpeg for thumbnail generation
vi.mock('@ffmpeg/ffmpeg', () => ({
  createFFmpeg: vi.fn(() => ({
    load: vi.fn(),
    write: vi.fn(),
    run: vi.fn(),
    read: vi.fn(),
  })),
}));
