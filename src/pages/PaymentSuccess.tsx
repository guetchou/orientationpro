
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-lg mx-auto border-2 border-green-500/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Paiement réussi</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Votre paiement a été traité avec succès. Vous avez maintenant accès à tous vos résultats de test détaillés.
            </p>
            <div className="flex flex-col space-y-3">
              <Button asChild>
                <Link to="/test-results">Voir mes résultats</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Retour au tableau de bord</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
