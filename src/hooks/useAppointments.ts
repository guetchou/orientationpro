
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "sonner";
import { Appointment } from '@/types/appointments';

export const useAppointments = (conseillerId: string | undefined) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    if (!conseillerId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:student_id (
            email
          )
        `)
        .eq('conseiller_id', conseillerId)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Rendez-vous ${status === 'confirmed' ? 'confirmé' : 'annulé'}`);
      await fetchAppointments();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      toast.error("Erreur lors de la mise à jour du rendez-vous");
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Rendez-vous supprimé");
      await fetchAppointments();
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      toast.error("Erreur lors de la suppression du rendez-vous");
    }
  };

  return {
    appointments,
    loading,
    fetchAppointments,
    updateAppointmentStatus,
    deleteAppointment
  };
};
