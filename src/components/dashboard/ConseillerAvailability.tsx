
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ConseillerAvailability = () => {
  const { toast } = useToast();
  
  const handleAddSlot = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La gestion des disponibilités sera bientôt disponible",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-900/50 dark:to-slate-900/50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Disponibilités
          </CardTitle>
          <Button onClick={handleAddSlot} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un créneau
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center p-8 text-muted-foreground">
            Votre calendrier de disponibilités sera bientôt disponible.
            Il vous permettra de définir vos créneaux de rendez-vous.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
