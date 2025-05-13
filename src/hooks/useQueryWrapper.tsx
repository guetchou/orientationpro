
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';
import { toast } from 'sonner';

/**
 * Hook wrapper autour de useQuery pour standardiser la gestion des erreurs et les notifications
 */
export function useQueryWithErrorHandling<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends any[] = any[]
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'> & {
    errorMessage?: string;
    successMessage?: string;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
  }
) {
  const { handleError } = useErrorHandler();
  const { 
    errorMessage = 'Erreur lors de la récupération des données',
    successMessage,
    showErrorToast = true,
    showSuccessToast = false,
    ...queryOptions 
  } = options || {};

  // Récupérer les callbacks spécifiés par l'utilisateur
  const userOnError = queryOptions.meta?.onError || queryOptions.meta?.onSettled;
  const userOnSuccess = queryOptions.meta?.onSuccess || queryOptions.meta?.onSettled;

  return useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
    meta: {
      ...queryOptions.meta,
      onError: (error: TError) => {
        handleError(error, errorMessage, { showToast: showErrorToast });
        if (userOnError && typeof userOnError === 'function') {
          userOnError(error);
        }
      },
      onSuccess: (data: TData) => {
        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }
        if (userOnSuccess && typeof userOnSuccess === 'function') {
          userOnSuccess(data);
        }
      }
    }
  });
}

/**
 * Hook wrapper autour de useMutation pour standardiser la gestion des erreurs et les notifications
 */
export function useMutationWithErrorHandling<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
    errorMessage?: string;
    successMessage?: string;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
  }
) {
  const { handleError } = useErrorHandler();
  const { 
    errorMessage = 'Erreur lors de la modification des données',
    successMessage = 'Opération réussie',
    showErrorToast = true,
    showSuccessToast = true,
    ...mutationOptions 
  } = options || {};

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onError: (error, variables, context) => {
      handleError(error, errorMessage, { showToast: showErrorToast });
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
  });
}

/**
 * Crée un QueryClient avec des options par défaut standardisées
 */
export const createStandardQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });
};

interface StandardQueryClientProviderProps {
  children: React.ReactNode;
  client?: QueryClient;
}

/**
 * Fournit un contexte React Query standardisé avec gestion d'erreur
 */
export const StandardQueryClientProvider: React.FC<StandardQueryClientProviderProps> = ({ children, client }) => {
  const standardClient = client || createStandardQueryClient();
  
  return (
    <QueryClientProvider client={standardClient}>
      {children}
    </QueryClientProvider>
  );
};
