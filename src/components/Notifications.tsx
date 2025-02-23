import { Toaster } from 'sonner';
import { useTheme } from '@/hooks/use-theme';

export function Notifications() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      theme={theme as 'light' | 'dark'}
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
    />
  );
}
