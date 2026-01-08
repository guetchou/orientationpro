
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, Book } from "lucide-react";
import { RecentTests } from "@/components/dashboard/RecentTests";

interface DashboardTabsProps {
  appointmentsCount: number;
  onNavigate: (path: string) => void;
}

export const DashboardTabs = ({ appointmentsCount, onNavigate }: DashboardTabsProps) => {
  return (
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
            {appointmentsCount > 0 ? (
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
                
                <Button variant="outline" className="w-full" onClick={() => onNavigate("/appointment")}>
                  Voir tous les rendez-vous
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun rendez-vous programmé</h3>
                <p className="text-gray-500 mb-4">Prenez rendez-vous avec un conseiller d'orientation pour obtenir des conseils personnalisés</p>
                <Button onClick={() => onNavigate("/conseillers")}>
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
              
              <Button variant="outline" className="w-full" onClick={() => onNavigate("/resources")}>
                Voir toutes les ressources
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
