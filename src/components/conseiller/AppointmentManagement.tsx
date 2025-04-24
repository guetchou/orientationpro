
import { AppointmentCalendar } from "../appointments/AppointmentCalendar";
import { AppointmentHistory } from "../appointments/AppointmentHistory";
import { AppointmentNotifications } from "../appointments/AppointmentNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export const AppointmentManagement = () => {
  return (
    <div className="space-y-6">
      <AppointmentNotifications />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestion des rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AppointmentCalendar />
          <AppointmentHistory />
        </CardContent>
      </Card>
    </div>
  );
};
