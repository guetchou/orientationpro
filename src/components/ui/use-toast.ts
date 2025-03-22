
import * as React from "react";
import { toast as sonnerToast, ToastT } from "sonner";

type ToastProps = React.ComponentProps<typeof ToastT>;

export const useToast = () => {
  return {
    toast: sonnerToast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  };
};

export const toast = sonnerToast;
