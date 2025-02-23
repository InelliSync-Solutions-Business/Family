import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Loading({
  size = 'md',
  fullscreen = false,
  text,
  className,
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullscreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        className
      )}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-current border-t-transparent text-primary',
          sizeMap[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps extends LoadingProps {
  show: boolean;
}

export function LoadingOverlay({
  show,
  size = 'md',
  text,
  className,
}: LoadingOverlayProps) {
  if (!show) return null;
  return <Loading size={size} fullscreen text={text} className={className} />;
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  spinnerSize?: 'sm' | 'md';
  className?: string;
}

export function LoadingButton({
  loading,
  children,
  spinnerSize = 'sm',
  className,
}: LoadingButtonProps) {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loading size={spinnerSize} />
        </div>
      )}
    </div>
  );
}
