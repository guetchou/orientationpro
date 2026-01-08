
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "sonner";

interface Availability {
  id: string;
  conseiller_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const useAvailability = (conseillerId: string | undefined) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailabilities = async () => {
    if (!conseillerId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('conseiller_id', conseillerId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      toast.error("Erreur lors du chargement des disponibilités");
    } finally {
      setLoading(false);
    }
  };

  const addAvailability = async (newAvailability: Omit<Availability, 'id'>) => {
    try {
      const { error } = await supabase
        .from('availabilities')
        .insert([newAvailability]);

      if (error) throw error;
      toast.success("Disponibilité ajoutée avec succès");
      await fetchAvailabilities();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la disponibilité:', error);
      toast.error("Erreur lors de l'ajout de la disponibilité");
    }
  };

  const updateAvailability = async (id: string, updates: Partial<Availability>) => {
    try {
      const { error } = await supabase
        .from('availabilities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success("Disponibilité mise à jour avec succès");
      await fetchAvailabilities();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error);
      toast.error("Erreur lors de la mise à jour de la disponibilité");
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Disponibilité supprimée avec succès");
      await fetchAvailabilities();
    } catch (error) {
      console.error('Erreur lors de la suppression de la disponibilité:', error);
      toast.error("Erreur lors de la suppression de la disponibilité");
    }
  };

  return {
    availabilities,
    loading,
    fetchAvailabilities,
    addAvailability,
    updateAvailability,
    deleteAvailability
  };
};
