
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createAppError, AppError } from '@/utils/errorHandler';

type ErrorWithCode = Error & { code?: string; details?: any; };

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  captureToAnalytics?: boolean;
}

/**
 * Hook pour standardiser la gestion des erreurs dans l'application
 */
export const useErrorHandler = (defaultOptions: UseErrorHandlerOptions = {
  showToast: true,
  logToConsole: true,
  captureToAnalytics: false,
}) => {
  const [error, setError] = useState<ErrorWithCode | null>(null);
  const [isError, setIsError] = useState(false);

  /**
   * Fonction pour gérer une erreur
   */
  const handleError = useCallback((
    err: unknown, 
    message?: string,
    options?: UseErrorHandlerOptions
  ) => {
    // Fusionner les options par défaut avec celles fournies
    const mergedOptions = { ...defaultOptions, ...options };
    const { showToast, logToConsole, captureToAnalytics } = mergedOptions;
    
    // Convertir l'erreur en objet standard
    let standardError: ErrorWithCode;
    
    if (err instanceof AppError) {
      standardError = err;
    } else if (err instanceof Error) {
      standardError = err;
    } else if (typeof err === 'string') {
      standardError = new Error(err);
    } else {
      standardError = new Error(message || 'Une erreur inattendue est survenue');
      if (err && typeof err === 'object') {
        standardError.details = err;
      }
    }
    
    // Afficher un toast si demandé
    if (showToast) {
      toast.error(message || standardError.message);
    }
    
    // Logger l'erreur si demandé
    if (logToConsole) {
      console.error('Error handled by useErrorHandler:', standardError);
      if (standardError.details) {
        console.error('Error details:', standardError.details);
      }
    }
    
    // Envoyer à un service d'analyse si demandé
    if (captureToAnalytics) {
      // Ici, vous pourriez intégrer un service comme Sentry
      console.log('Error would be sent to analytics service');
    }
    
    // Mettre à jour l'état local
    setError(standardError);
    setIsError(true);
    
    return standardError;
  }, [defaultOptions]);

  /**
   * Fonction pour effacer l'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  /**
   * Fonction pour créer une fonction try/catch autour d'une fonction asynchrone
   */
  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorMessage?: string,
    options?: UseErrorHandlerOptions
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        return await fn(...args);
      } catch (err) {
        handleError(err, errorMessage, options);
        throw err; // Propager l'erreur pour permettre une gestion supplémentaire
      }
    };
  }, [handleError]);

  /**
   * Fonction utilitaire pour créer une erreur typée
   */
  const createError = useCallback((
    message: string,
    code?: string,
    details?: unknown
  ): AppError => {
    return createAppError(message, code, details);
  }, []);

  return {
    error,
    isError,
    handleError,
    clearError,
    withErrorHandling,
    createError
  };
};
