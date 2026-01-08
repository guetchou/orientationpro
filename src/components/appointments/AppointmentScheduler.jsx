
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fr } from 'date-fns/locale';
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { toast } from "sonner";

const timeSlots = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
];

export const AppointmentScheduler = ({ counselorId, counselorName }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et une heure");
      return;
    }

    // Simuler la réservation
    toast.success(`Rendez-vous confirmé avec ${counselorName} le ${format(selectedDate, 'dd/MM/yyyy')} à ${selectedTime}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez une date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              disabled={(date) => 
                date < new Date() || 
                date.getDay() === 0 || 
                date.getDay() === 6
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez un horaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {time}
                </Button>
              ))}
            </div>

            <Button
              className="w-full mt-6"
              onClick={handleScheduleAppointment}
              disabled={!selectedDate || !selectedTime}
            >
              Confirmer le rendez-vous
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Résumé du rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Conseiller :</span> {counselorName}
              </p>
              <p>
                <span className="font-semibold">Date :</span>{' '}
                {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
              </p>
              <p>
                <span className="font-semibold">Heure :</span> {selectedTime}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
