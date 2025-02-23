import { toast, Toast } from 'sonner';

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

    const toastOptions: Partial<Toast> = {
      id,
      duration,
      onDismiss,
    };

    if (action) {
      toastOptions.action = {
        label: action.label,
        onClick: action.onClick,
      };
    }

    if (description) {
      toastOptions.description = description;
    }

    if (promise) {
      return toast.promise(
        promise,
        {
          loading: title,
          success: (data) => ({
            title: typeof data === 'string' ? data : 'Success',
            description: typeof data === 'string' ? undefined : description,
          }),
          error: (err) => ({
            title: err.message || 'Error',
            description: typeof err === 'string' ? err : description,
          }),
        },
        toastOptions
      );
    }

    switch (type) {
      case 'success':
        return toast.success(title, toastOptions);
      case 'error':
        return toast.error(title, toastOptions);
      case 'warning':
        return toast.warning(title, toastOptions);
      case 'info':
      default:
        return toast(title, toastOptions);
    }
  };

  const success = (title: string, options?: NotificationOptions) =>
    notify('success', title, options);

  const error = (title: string, options?: NotificationOptions) =>
    notify('error', title, options);

  const warning = (title: string, options?: NotificationOptions) =>
    notify('warning', title, options);

  const info = (title: string, options?: NotificationOptions) =>
    notify('info', title, options);

  const promise = <T>(
    promise: Promise<T>,
    title: string,
    options?: NotificationOptions
  ) => notify('info', title, { ...options, promise });

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  return {
    notify,
    success,
    error,
    warning,
    info,
    promise,
    dismiss,
  };
}
