
import React, { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import { Appointment } from "@/types/appointments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AppointmentTimeslotsProps {
  date: Date;
}

export const AppointmentTimeslots = ({ date }: AppointmentTimeslotsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useUser();

  useEffect(() => {
    fetchAppointmentsForDate();
  }, [date, user]);

  const fetchAppointmentsForDate = async () => {
    if (!user?.id) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:student_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('conseiller_id', user.id)
        .eq('date', formattedDate)
        .order('time', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format appointment display
  const getAppointmentStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAppointmentStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      default: return 'En attente';
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Format HH:mm from HH:mm:ss
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Aucun rendez-vous pour cette journée
        </div>
      ) : (
        <ul className="space-y-2">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatTime(appointment.time)}</p>
                  <p className="text-sm text-gray-600">
                    {appointment.profiles?.first_name || ''} {appointment.profiles?.last_name || ''}
                    {!appointment.profiles?.first_name && !appointment.profiles?.last_name && appointment.profiles?.email}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAppointmentStatusClass(appointment.status)}`}>
                  {getAppointmentStatusText(appointment.status)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
