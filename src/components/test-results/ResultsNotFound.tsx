
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ResultsNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center bg-amber-50 dark:bg-amber-900/20 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileQuestion className="mr-2 h-6 w-6" />
            Résultats introuvables
          </CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400">
            Nous n'avons pas trouvé les résultats de test demandés.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Les résultats que vous recherchez n'existent pas ou ne sont plus disponibles.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Retour au tableau de bord
              </Button>
              <Button onClick={() => navigate('/tests')} variant="default">
                Passer un nouveau test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsNotFound;
