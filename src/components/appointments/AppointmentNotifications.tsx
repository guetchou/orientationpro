
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { Appointment } from "@/types/appointments";

export const AppointmentNotifications = () => {
  const { toast } = useToast();
  const user = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `conseiller_id=eq.${user.id}`
        },
        (payload) => {
          const appointment = payload.new as Appointment;
          
          switch (payload.eventType) {
            case 'INSERT':
              toast({
                title: "Nouveau rendez-vous",
                description: `Un nouveau rendez-vous a été programmé pour le ${new Date(appointment.date).toLocaleDateString('fr-FR')}`,
              });
              break;
            case 'UPDATE':
              if (appointment.status === 'confirmed') {
                toast({
                  title: "Rendez-vous confirmé",
                  description: `Le rendez-vous du ${new Date(appointment.date).toLocaleDateString('fr-FR')} a été confirmé`,
                });
              } else if (appointment.status === 'cancelled') {
                toast({
                  title: "Rendez-vous annulé",
                  description: `Le rendez-vous du ${new Date(appointment.date).toLocaleDateString('fr-FR')} a été annulé`,
                });
              }
              break;
            case 'DELETE':
              toast({
                title: "Rendez-vous supprimé",
                description: "Le rendez-vous a été supprimé avec succès",
              });
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return null;
};
