
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface AppointmentSchedulerProps {
  counselorId: string;
  counselorName: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ 
  counselorId, 
  counselorName 
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (date && counselorId) {
      fetchAvailableSlots();
    }
  }, [date, counselorId]);

  const fetchAvailableSlots = async () => {
    if (!date) return;
    
    setIsLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('counselor_id', counselorId)
        .eq('date', formattedDate)
        .eq('is_available', true);
      
      if (error) throw error;
      
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Impossible de charger les créneaux disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour prendre rendez-vous');
      return;
    }
    
    if (!selectedSlot) {
      toast.error('Veuillez sélectionner un créneau horaire');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Insérer le rendez-vous
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          counselor_id: counselorId,
          date: date?.toISOString().split('T')[0],
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          status: 'confirmed'
        });
      
      if (error) throw error;
      
      // Mettre à jour la disponibilité
      await supabase
        .from('availability')
        .update({ is_available: false })
        .eq('id', selectedSlot.id);
      
      toast.success('Rendez-vous confirmé avec succès');
      setSelectedSlot(null);
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error("Erreur lors de la prise de rendez-vous");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Sélectionner une date
          </CardTitle>
          <CardDescription>
            Choisissez une date pour voir les créneaux disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={{ before: new Date() }}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Conseiller sélectionné
            </CardTitle>
            <CardDescription>
              {counselorName || "Aucun conseiller sélectionné"}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Créneaux disponibles
            </CardTitle>
            <CardDescription>
              {date ? `Créneaux pour le ${date.toLocaleDateString('fr-FR')}` : "Veuillez sélectionner une date"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                    onClick={() => setSelectedSlot(slot)}
                    className="text-sm"
                  >
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Aucun créneau disponible pour cette date
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          {user ? (
            <Button 
              onClick={handleBookAppointment} 
              className="w-full" 
              disabled={!selectedSlot || isSubmitting}
            >
              {isSubmitting ? 'Réservation en cours...' : 'Confirmer le rendez-vous'}
            </Button>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-gray-600">
                Connectez-vous pour prendre rendez-vous
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/login">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Inscription</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export aussi comme default pour compatibilité avec les imports existants
export default AppointmentScheduler;
