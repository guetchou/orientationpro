import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ClipboardList, BookOpen } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const startTest = () => {
    navigate("/test-riasec");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Test d'Orientation
            </CardTitle>
            <CardDescription>
              Découvrez votre profil professionnel avec notre test RIASEC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startTest} className="w-full">
              Commencer le test
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Mes Résultats
            </CardTitle>
            <CardDescription>
              Consultez vos résultats précédents et suivez votre progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/dashboard/results")} className="w-full">
              Voir mes résultats
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ressources
            </CardTitle>
            <CardDescription>
              Accédez à nos guides et ressources pour l'orientation professionnelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Explorer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;