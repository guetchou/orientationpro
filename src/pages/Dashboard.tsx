
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileBarChart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConseillerStats } from "@/types/dashboard";
import { UserStatistics } from "@/components/dashboard/UserStatistics";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { UserGoals } from "@/components/dashboard/UserGoals";
import { ProfessionalProfile } from "@/components/dashboard/ProfessionalProfile";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ConseillerStats>({
    total_students: 0,
    tests_completed: 0,
    appointments_scheduled: 0,
    average_progress: 0
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Récupérer le profil - make sure to convert id to string if it's a number
        const userId = typeof user.id === 'number' ? String(user.id) : user.id;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération du profil:", error);
          // Si pas de profil, rediriger vers onboarding
          navigate("/onboarding");
          return;
        }

        if (!data || !data.department || data.status !== 'active') {
          // Si profil incomplet, rediriger vers onboarding
          navigate("/onboarding");
          return;
        }

        setProfile(data);

        // Si admin ou conseiller, rediriger vers leur dashboard
        if (data.department === 'admin') {
          navigate("/admin/dashboard");
          return;
        } else if (data.department === 'conseiller') {
          navigate("/conseiller/dashboard");
          return;
        }

        // Récupérer les stats pour l'étudiant
        const { data: testsData } = await supabase
          .from('test_results')
          .select('*')
          .eq('user_id', userId);

        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*')
          .eq('student_id', userId);

        setStats({
          total_students: 1, // L'étudiant lui-même
          tests_completed: testsData?.length || 0,
          appointments_scheduled: appointmentsData?.length || 0,
          average_progress: 30 // Valeur par défaut
        });

      } catch (err) {
        console.error("Erreur:", err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user, navigate]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bienvenue, {profile?.first_name || "Étudiant"}</h1>
            <p className="text-gray-600">Voici un résumé de votre parcours d'orientation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleNavigate("/tests")}>
              <FileBarChart className="mr-2 h-4 w-4" />
              Passer un test
            </Button>
            <Button onClick={() => handleNavigate("/conseillers")} className="bg-gradient-to-r from-primary to-primary/80">
              <CalendarDays className="mr-2 h-4 w-4" />
              Prendre rendez-vous
            </Button>
          </div>
        </div>

        <UserStatistics stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardTabs 
              appointmentsCount={stats.appointments_scheduled} 
              onNavigate={handleNavigate} 
            />
          </div>
          
          <div>
            <UserGoals />
            <ProfessionalProfile 
              testsCompleted={stats.tests_completed} 
              onNavigate={handleNavigate} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
