
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvailabilitySlot } from "@/types/dashboard";
import { toast } from 'sonner';
import { CalendarDays, Clock, Plus, Trash } from 'lucide-react';

export function AvailabilityManager() {
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  const [slots, setSlots] = useState<AvailabilitySlot[]>([
    { id: "1", day: "Lundi", startTime: "08:00", endTime: "12:00", isAvailable: true },
    { id: "2", day: "Lundi", startTime: "14:00", endTime: "18:00", isAvailable: true },
    { id: "3", day: "Mercredi", startTime: "09:00", endTime: "15:00", isAvailable: true },
    { id: "4", day: "Vendredi", startTime: "13:00", endTime: "19:00", isAvailable: true },
  ]);

  const [newSlot, setNewSlot] = useState<Omit<AvailabilitySlot, 'id' | 'isAvailable'>>({
    day: '',
    startTime: '',
    endTime: ''
  });

  const isValidTimeRange = (start: string, end: string) => {
    const startTime = start.split(':').map(Number);
    const endTime = end.split(':').map(Number);
    
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    return endMinutes > startMinutes;
  };

  const hasOverlap = (day: string, start: string, end: string, excludeId?: string) => {
    return slots.some(slot => {
      if (excludeId && slot.id === excludeId) return false;
      if (slot.day !== day) return false;
      
      const slotStart = slot.startTime.split(':').map(Number);
      const slotEnd = slot.endTime.split(':').map(Number);
      const newStart = start.split(':').map(Number);
      const newEnd = end.split(':').map(Number);
      
      const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
      const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];
      const newStartMinutes = newStart[0] * 60 + newStart[1];
      const newEndMinutes = newEnd[0] * 60 + newEnd[1];
      
      return (
        (newStartMinutes >= slotStartMinutes && newStartMinutes < slotEndMinutes) ||
        (newEndMinutes > slotStartMinutes && newEndMinutes <= slotEndMinutes) ||
        (newStartMinutes <= slotStartMinutes && newEndMinutes >= slotEndMinutes)
      );
    });
  };

  const addSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    if (!isValidTimeRange(newSlot.startTime, newSlot.endTime)) {
      toast.error("L'heure de fin doit être postérieure à l'heure de début");
      return;
    }
    
    if (hasOverlap(newSlot.day, newSlot.startTime, newSlot.endTime)) {
      toast.error("Ce créneau chevauche un créneau existant");
      return;
    }
    
    const id = Math.random().toString(36).substring(2, 11);
    setSlots([...slots, { ...newSlot, id, isAvailable: true }]);
    setNewSlot({ day: '', startTime: '', endTime: '' });
    toast.success("Créneau ajouté avec succès");
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter(slot => slot.id !== id));
    toast.success("Créneau supprimé");
  };

  const toggleAvailability = (id: string) => {
    setSlots(slots.map(slot => 
      slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="h-5 w-5 mr-2" />
          Gestion des disponibilités
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Gérez vos créneaux de disponibilité</h3>
            <p className="text-blue-700 text-sm">
              Les étudiants pourront prendre rendez-vous uniquement pendant les créneaux que vous définissez comme disponibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
              <Select
                value={newSlot.day}
                onValueChange={(value) => setNewSlot({ ...newSlot, day: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jour" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
              <Select
                value={newSlot.startTime}
                onValueChange={(value) => setNewSlot({ ...newSlot, startTime: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Heure de début" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
              <Select
                value={newSlot.endTime}
                onValueChange={(value) => setNewSlot({ ...newSlot, endTime: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Heure de fin" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={addSlot} className="w-full flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un créneau
          </Button>

          <h3 className="font-medium text-lg mt-8 mb-4">Vos créneaux</h3>
          
          {slots.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {slots.map((slot) => (
                <div 
                  key={slot.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border 
                    ${slot.isAvailable 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${slot.isAvailable ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <Clock className={`h-5 w-5 ${slot.isAvailable ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{slot.day}</p>
                      <p className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={slot.isAvailable ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleAvailability(slot.id)}
                    >
                      {slot.isAvailable ? "Désactiver" : "Activer"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSlot(slot.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun créneau défini</h3>
              <p className="text-gray-500 mb-4">Ajoutez des créneaux pour permettre aux étudiants de prendre rendez-vous</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
