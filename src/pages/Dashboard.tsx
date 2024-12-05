import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const startTest = () => {
    navigate("/test-riasec");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold text-primary">
              Tableau de Bord
            </h1>
            <Button onClick={handleLogout} variant="outline">
              Déconnexion
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card pour commencer un test */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-heading text-xl font-semibold mb-4">Test d'Orientation</h2>
            <p className="text-gray-600 mb-4">
              Découvrez votre profil professionnel avec notre test d'orientation RIASEC
            </p>
            <Button onClick={startTest} className="w-full">Commencer le test</Button>
          </div>

          {/* Card pour voir les résultats */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-heading text-xl font-semibold mb-4">Mes Résultats</h2>
            <p className="text-gray-600 mb-4">
              Consultez vos résultats précédents et suivez votre progression
            </p>
            <Button variant="outline" className="w-full">Voir mes résultats</Button>
          </div>

          {/* Card pour les ressources */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-heading text-xl font-semibold mb-4">Ressources</h2>
            <p className="text-gray-600 mb-4">
              Accédez à nos guides et ressources pour l'orientation professionnelle
            </p>
            <Button variant="outline" className="w-full">Explorer</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;