
import { toast } from "sonner";

interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

class AppError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): ErrorResponse => {
  console.error('Error caught by global handler:', error);

  if (error instanceof AppError) {
    toast.error(error.message);
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }

  if (error instanceof Error) {
    toast.error(error.message);
    return {
      message: error.message
    };
  }

  const defaultMessage = "Une erreur inattendue s'est produite";
  toast.error(defaultMessage);
  return {
    message: defaultMessage
  };
};

export const createAppError = (
  message: string,
  code?: string,
  details?: unknown
): AppError => {
  return new AppError(message, code, details);
};

export { AppError };
