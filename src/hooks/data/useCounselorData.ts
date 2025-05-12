
import { useQueryWithErrorHandling, useMutationWithErrorHandling } from '../useQueryWrapper';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook pour gérer les données des conseillers avec React Query
 */
export const useCounselorData = (counselorId?: string) => {
  // Récupérer tous les conseillers
  const getAllCounselors = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'counselor');
    
    if (error) throw error;
    return data;
  };
  
  // Récupérer un conseiller par son ID
  const getCounselor = async (id: string) => {
    if (!id) throw new Error('ID du conseiller non fourni');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  };
  
  // Mettre à jour un conseiller
  const updateCounselor = async ({ id, counselorData }: { id: string, counselorData: any }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(counselorData)
      .eq('id', id);
    
    if (error) throw error;
    return data;
  };
  
  // Utilisation des hooks React Query
  const counselorsQuery = useQueryWithErrorHandling(
    ['counselors'],
    getAllCounselors,
    {
      errorMessage: 'Erreur lors du chargement des conseillers',
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  const counselorQuery = useQueryWithErrorHandling(
    ['counselor', counselorId],
    () => getCounselor(counselorId!),
    {
      enabled: !!counselorId,
      errorMessage: 'Erreur lors du chargement du conseiller',
    }
  );
  
  const updateCounselorMutation = useMutationWithErrorHandling(
    updateCounselor,
    {
      successMessage: 'Conseiller mis à jour avec succès',
      errorMessage: 'Erreur lors de la mise à jour du conseiller',
    }
  );
  
  return {
    counselors: counselorsQuery.data || [],
    counselor: counselorQuery.data,
    isLoading: counselorsQuery.isLoading || (!!counselorId && counselorQuery.isLoading),
    isError: counselorsQuery.isError || (!!counselorId && counselorQuery.isError),
    error: counselorsQuery.error || (counselorQuery.error),
    updateCounselor: updateCounselorMutation.mutate,
    isUpdating: updateCounselorMutation.isPending,
    refetchCounselors: counselorsQuery.refetch,
    refetchCounselor: counselorQuery.refetch,
  };
};
