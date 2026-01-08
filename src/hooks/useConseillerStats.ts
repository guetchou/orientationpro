
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { ConseillerStats } from '@/types/dashboard';

export const useConseillerStats = (conseillerId: string) => {
  return useQuery({
    queryKey: ['conseillerStats', conseillerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('conseiller_id', conseillerId)
        .single();

      if (error) throw error;

      // Ajouter des valeurs calculées pour les statistiques de croissance
      const defaultData = {
        total_students: data?.total_students || 0,
        tests_completed: data?.tests_completed || 0,
        appointments_scheduled: data?.appointments_scheduled || 0,
        average_progress: data?.average_progress || 0,
        tests_growth: 5, // Valeur par défaut pour la démonstration
        appointment_growth: 3, // Valeur par défaut pour la démonstration
        skill_points: 420 // Valeur par défaut
      } as ConseillerStats;

      return defaultData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
