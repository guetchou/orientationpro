
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-lg mx-auto border-2 border-red-500/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Paiement annulé</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Votre paiement a été annulé. Si vous avez rencontré des problèmes, n'hésitez pas à contacter notre service client.
            </p>
            <div className="flex flex-col space-y-3">
              <Button asChild>
                <Link to="/payment">Réessayer</Link>
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

export default PaymentCancel;
