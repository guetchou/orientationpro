
import { toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  [key: string]: any;
};

export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      toast(props.title, {
        description: props.description,
        action: props.action,
        ...props,
      });
    },
    success: (message: string, options?: any) => toast.success(message, options),
    error: (message: string, options?: any) => toast.error(message, options),
    info: (message: string, options?: any) => toast.info(message, options),
    warning: (message: string, options?: any) => toast.warning(message, options),
    custom: (content: React.ReactNode, options?: any) => toast(content, options),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
    // This is for compatibility with the shadcn toast component
    toasts: [],
  };
};
