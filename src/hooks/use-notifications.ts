import { toast } from 'sonner';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  id?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  promise?: Promise<any>;
  onDismiss?: () => void;
}

const DEFAULT_DURATION = 5000;

export function useNotifications() {
  const notify = (
    type: NotificationType,
    title: string,
    options: NotificationOptions = {}
  ) => {
    const {
      id,
      duration = DEFAULT_DURATION,
      action,
      description,
      promise,
      onDismiss,
    } = options;

    const toastOptions = {
      id,
      duration,
      onDismiss,
      ...(action && {
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      }),
    };

    if (promise) {
      toast.promise(promise, {
        ...toastOptions,
        loading: title,
        success: description || 'Completed successfully',
        error: (err: Error) => err.message || 'Something went wrong',
      });
      return;
    }

    switch (type) {
      case 'success':
        return toast.success(title, { ...toastOptions, description });
      case 'error':
        return toast.error(title, { ...toastOptions, description });
      case 'warning':
        return toast.warning(title, { ...toastOptions, description });
      case 'info':
      default:
        return toast(title, { ...toastOptions, description });
    }
  };

  return {
    notify,
    success: (title: string, options?: NotificationOptions) =>
      notify('success', title, options),
    error: (title: string, options?: NotificationOptions) =>
      notify('error', title, options),
    warning: (title: string, options?: NotificationOptions) =>
      notify('warning', title, options),
    info: (title: string, options?: NotificationOptions) =>
      notify('info', title, options),
    promise: <T>(
      promise: Promise<T>,
      title: string,
      options?: NotificationOptions
    ) => notify('info', title, { ...options, promise }),
  };
}
