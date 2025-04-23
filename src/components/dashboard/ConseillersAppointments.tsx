
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentCalendar } from '../appointments/AppointmentCalendar';
import { AppointmentHistory } from '../appointments/AppointmentHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ClockIcon, CheckCircle } from "lucide-react";

export const ConseillersAppointments = () => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-900/50 dark:to-slate-900/50">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Gestion des Rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-4">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              À venir
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <AppointmentCalendar />
          </TabsContent>

          <TabsContent value="upcoming">
            <AppointmentHistory />
          </TabsContent>

          <TabsContent value="history">
            <AppointmentHistory />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
