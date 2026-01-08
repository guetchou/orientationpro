import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, MessageSquare, Video, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AppointmentSchedulerProps {
  counselorId: number;
  counselorName: string;
  onAppointmentCreated?: (appointment: any) => void;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  duration: number;
}

interface Counselor {
  id: number;
  name: string;
  specializations: string[];
  rating: number;
  bio: string;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  counselorId,
  counselorName,
  onAppointmentCreated
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('orientation');
  const [duration, setDuration] = useState(60);
  const [clientNotes, setClientNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Générer les dates disponibles (7 prochains jours)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Charger les créneaux disponibles quand la date change
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, counselorId]);

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/slots/${counselorId}?date=${selectedDate}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.available_slots);
      } else {
        toast.error('Erreur lors du chargement des créneaux');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error('Veuillez sélectionner une date et un horaire');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        counselor_id: counselorId,
        appointment_type: appointmentType,
        scheduled_at: `${selectedDate}T${selectedTime}:00`,
        duration_minutes: duration,
        client_notes: clientNotes
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setShowSuccess(true);
        toast.success('Rendez-vous créé avec succès !');
        
        if (onAppointmentCreated) {
          onAppointmentCreated(data.appointment);
        }

        // Reset form
        setTimeout(() => {
          setSelectedDate('');
          setSelectedTime('');
          setClientNotes('');
          setShowSuccess(false);
        }, 3000);
      } else {
        toast.error(data.message || 'Erreur lors de la création du rendez-vous');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Rendez-vous confirmé !
        </h3>
        <p className="text-gray-600">
          Votre rendez-vous avec {counselorName} a été créé avec succès.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Vous recevrez un email de confirmation avec le lien de la réunion.
        </p>
      </motion.div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Prendre rendez-vous avec {counselorName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de rendez-vous */}
          <div className="space-y-2">
            <Label htmlFor="appointment-type">Type de rendez-vous</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orientation">Orientation professionnelle</SelectItem>
                <SelectItem value="cv_review">Révision de CV</SelectItem>
                <SelectItem value="career_advice">Conseil de carrière</SelectItem>
                <SelectItem value="follow_up">Suivi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Durée */}
          <div className="space-y-2">
            <Label htmlFor="duration">Durée</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sélection de date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une date" />
              </SelectTrigger>
              <SelectContent>
                {generateAvailableDates().map((date) => {
                  const dateObj = new Date(date);
                  return (
                    <SelectItem key={date} value={date}>
                      {dateObj.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection d'horaire */}
          {selectedDate && (
            <div className="space-y-2">
              <Label htmlFor="time">Horaire</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Chargement des créneaux...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <AnimatePresence>
                    {availableSlots.map((slot, index) => (
                      <motion.button
                        key={index}
                        type="button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTime(formatTime(slot.start_time))}
                        className={`p-3 text-sm border rounded-lg transition-all ${
                          selectedTime === formatTime(slot.start_time)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        {formatTime(slot.start_time)}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              
              {!isLoading && availableSlots.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun créneau disponible pour cette date
                </p>
              )}
            </div>
          )}

          {/* Notes du client */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Décrivez brièvement vos attentes ou questions..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Informations de la réunion */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Informations de la réunion
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Réunion en ligne via lien sécurisé</li>
              <li>• Vous recevrez le lien par email</li>
              <li>• Durée : {duration} minutes</li>
              <li>• Type : {appointmentType.replace('_', ' ')}</li>
            </ul>
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Confirmer le rendez-vous
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
