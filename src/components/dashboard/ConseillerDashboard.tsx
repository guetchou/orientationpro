
import { useState, useCallback } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConseillerStats } from "@/hooks/useConseillerStats";
import { handleError } from "@/utils/errorHandler";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from "@supabase/auth-helpers-react";
import { ConseillersAppointments } from "./ConseillersAppointments";
import { ConseillerAvailability } from "./ConseillerAvailability";
import { StudentsTab } from "./tabs/StudentsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { Calendar, Users, FileText, Clock } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1
    },
  },
});

export const ConseillerDashboard = () => {
  const currentUser = useUser();
  const userId = currentUser?.id;
  
  const { data: stats, isLoading, error } = useConseillerStats(userId);
  
  const handleErrors = useCallback((error: unknown) => {
    handleError(error);
  }, []);

  const [fallbackStats] = useState({
    total_students: 35,
    tests_completed: 87,
    appointments_scheduled: 24,
    average_progress: 68
  });

  if (error) {
    handleErrors(error);
    return <div>Erreur de chargement du dashboard</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Conseiller</h1>
        </div>

        {!isLoading && <DashboardStats stats={stats || fallbackStats} />}

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Disponibilités
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Mes Étudiants
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Rapports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <ConseillersAppointments />
          </TabsContent>

          <TabsContent value="availability">
            <ConseillerAvailability />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
};
