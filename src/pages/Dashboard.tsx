import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConseillerStats } from "@/types/dashboard";
import { RecentTests } from "@/components/dashboard/RecentTests";
import { Goals } from "@/components/dashboard/Goals";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Book, FileBarChart, GraduationCap, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
            <Button variant="outline" onClick={() => navigate("/tests")}>
              <FileBarChart className="mr-2 h-4 w-4" />
              Passer un test
            </Button>
            <Button onClick={() => navigate("/conseillers")} className="bg-gradient-to-r from-primary to-primary/80">
              <CalendarDays className="mr-2 h-4 w-4" />
              Prendre rendez-vous
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tests complétés</p>
                  <p className="text-3xl font-bold">{stats.tests_completed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileBarChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/dashboard/results")}>
                  Voir les résultats →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rendez-vous</p>
                  <p className="text-3xl font-bold">{stats.appointments_scheduled}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/conseillers")}>
                  Prendre rendez-vous →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Orientation</p>
                  <p className="text-3xl font-bold">{stats.average_progress}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 h-2 rounded-full">
                  <div 
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${stats.average_progress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="tests">Derniers tests</TabsTrigger>
                <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
                <TabsTrigger value="resources">Ressources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tests">
                <Card>
                  <CardHeader>
                    <CardTitle>Vos tests d'orientation</CardTitle>
                    <CardDescription>
                      Les tests que vous avez passés ou qui sont recommandés pour vous
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentTests />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Vos rendez-vous</CardTitle>
                    <CardDescription>
                      Rendez-vous passés et à venir avec vos conseillers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.appointments_scheduled > 0 ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start">
                          <div className="mr-4 mt-1">
                            <CalendarDays className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-800">Prochain rendez-vous</h4>
                            <p className="text-green-700 text-sm">Vendredi 12 septembre à 14h00</p>
                            <p className="text-green-600 text-sm mt-2">Avec Dr. Michel Patel</p>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full" onClick={() => navigate("/appointment")}>
                          Voir tous les rendez-vous
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun rendez-vous programmé</h3>
                        <p className="text-gray-500 mb-4">Prenez rendez-vous avec un conseiller d'orientation pour obtenir des conseils personnalisés</p>
                        <Button onClick={() => navigate("/conseillers")}>
                          Prendre rendez-vous
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Ressources recommandées</CardTitle>
                    <CardDescription>
                      Ressources personnalisées selon votre profil
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded mr-3">
                            <Book className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Guide des métiers du numérique</h4>
                            <p className="text-sm text-gray-500">PDF - 24 pages</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <div className="bg-purple-100 p-2 rounded mr-3">
                            <Book className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Les études d'ingénieur au Congo</h4>
                            <p className="text-sm text-gray-500">PDF - 18 pages</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-2 rounded mr-3">
                            <Book className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Réussir son orientation professionnelle</h4>
                            <p className="text-sm text-gray-500">PDF - 32 pages</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full" onClick={() => navigate("/resources")}>
                        Voir toutes les ressources
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Vos objectifs</CardTitle>
                <CardDescription>
                  Suivez votre progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Goals />
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Profil professionnel</CardTitle>
                <CardDescription>
                  D'après vos résultats de tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.tests_completed > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Domaines recommandés</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Informatique</Badge>
                        <Badge>Développement web</Badge>
                        <Badge>Intelligence artificielle</Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Traits de personnalité</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center justify-between">
                          <span>Analytique</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: "85%" }}></div>
                          </div>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Créatif</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: "70%" }}></div>
                          </div>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Logique</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: "90%" }}></div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/results")}>
                      Voir tous les résultats
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileBarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun test complété</h3>
                    <p className="text-gray-500 mb-4">Passez un test d'orientation pour connaître votre profil professionnel</p>
                    <Button onClick={() => navigate("/tests")}>
                      Passer un test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
