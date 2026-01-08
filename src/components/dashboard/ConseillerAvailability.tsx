
import React, { useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2 } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import { useState } from "react";

const DAYS_OF_WEEK = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
];

export const ConseillerAvailability = () => {
  const user = useUser();
  const { availabilities, loading, fetchAvailabilities, addAvailability, deleteAvailability } = useAvailability(user?.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00"
  });

  useEffect(() => {
    if (user?.id) {
      fetchAvailabilities();
    }
  }, [user]);

  const handleAddAvailability = async () => {
    if (!user?.id) return;

    await addAvailability({
      conseiller_id: user.id,
      ...newAvailability,
      is_available: true
    });

    setIsDialogOpen(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-900/50 dark:to-slate-900/50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Disponibilités
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un créneau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une disponibilité</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Jour de la semaine</Label>
                  <Select
                    value={newAvailability.day_of_week.toString()}
                    onValueChange={(value) => setNewAvailability(prev => ({ ...prev, day_of_week: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Heure de début</Label>
                  <Input
                    type="time"
                    value={newAvailability.start_time}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Heure de fin</Label>
                  <Input
                    type="time"
                    value={newAvailability.end_time}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddAvailability} className="w-full">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : availabilities.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Aucune disponibilité définie. Commencez par ajouter vos créneaux horaires.
          </div>
        ) : (
          <div className="space-y-4">
            {availabilities.map((availability) => (
              <div
                key={availability.id}
                className="flex justify-between items-center p-4 rounded-lg border bg-card"
              >
                <div>
                  <p className="font-medium">{DAYS_OF_WEEK[availability.day_of_week - 1]}</p>
                  <p className="text-sm text-muted-foreground">
                    {availability.start_time} - {availability.end_time}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAvailability(availability.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
