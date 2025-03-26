
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileBarChart } from "lucide-react";

interface ProfessionalProfileProps {
  testsCompleted: number;
  onNavigate: (path: string) => void;
}

export const ProfessionalProfile = ({ testsCompleted, onNavigate }: ProfessionalProfileProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Profil professionnel</CardTitle>
        <CardDescription>
          D'après vos résultats de tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {testsCompleted > 0 ? (
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
            
            <Button variant="outline" className="w-full" onClick={() => onNavigate("/dashboard/results")}>
              Voir tous les résultats
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileBarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun test complété</h3>
            <p className="text-gray-500 mb-4">Passez un test d'orientation pour connaître votre profil professionnel</p>
            <Button onClick={() => onNavigate("/tests")}>
              Passer un test
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
