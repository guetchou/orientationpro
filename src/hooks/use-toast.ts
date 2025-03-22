
import { toast } from "sonner";

// Simple hook to expose the toast methods for use across the application
export const useToast = () => {
  return {
    success: (message: string, options?: any) => toast.success(message, options),
    error: (message: string, options?: any) => toast.error(message, options),
    info: (message: string, options?: any) => toast.info(message, options),
    warning: (message: string, options?: any) => toast.warning(message, options),
    custom: (content: React.ReactNode, options?: any) => toast(content, options),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
    // Added toasts property to fix type error
    toasts: [],
  };
};
