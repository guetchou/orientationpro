
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ResultsErrorProps {
  error: string;
}

const ResultsError = ({ error }: ResultsErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center bg-red-50 dark:bg-red-900/20 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Erreur
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Une erreur est survenue lors du chargement des résultats du test.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Retour au tableau de bord
              </Button>
              <Button onClick={() => navigate('/tests')} variant="default">
                Retourner aux tests
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsError;
