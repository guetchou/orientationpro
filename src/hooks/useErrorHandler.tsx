
import { toast } from "sonner";

interface ErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  captureToSentry?: boolean;
}

/**
 * Hook personnalisé pour gérer les erreurs de manière standardisée
 */
export const useErrorHandler = () => {
  const defaultOptions: ErrorHandlingOptions = {
    showToast: true,
    logToConsole: true,
    captureToSentry: false,
  };

  /**
   * Gère une erreur de manière standardisée
   * @param error L'erreur à gérer
   * @param message Message d'erreur à afficher (remplace le message d'erreur par défaut)
   * @param options Options de gestion de l'erreur
   */
  const handleError = (
    error: any,
    message?: string,
    options?: Partial<ErrorHandlingOptions>
  ) => {
    const mergedOptions = { ...defaultOptions, ...options };
    const errorMessage = message || getErrorMessage(error);

    // Afficher dans la console
    if (mergedOptions.logToConsole) {
      console.error("Error handled:", error);
    }

    // Afficher une notification toast
    if (mergedOptions.showToast) {
      toast.error(errorMessage);
    }

    // Capture dans Sentry (à implémenter si nécessaire)
    if (mergedOptions.captureToSentry) {
      // Intégration future avec Sentry
      // captureException(error);
    }

    return errorMessage;
  };

  /**
   * Extrait un message d'erreur lisible à partir d'un objet d'erreur
   */
  const getErrorMessage = (error: any): string => {
    if (!error) return "Une erreur inconnue s'est produite";

    // Si c'est une erreur Supabase
    if (error.error_description) return error.error_description;
    if (error.message) return error.message;
    
    // Si c'est une erreur Axios
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    
    // Si c'est une chaîne de caractères
    if (typeof error === "string") return error;

    // Erreur par défaut
    return "Une erreur inattendue s'est produite";
  };

  return { handleError, getErrorMessage };
};
