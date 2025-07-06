import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle, Shield, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

export default function SuperAdmin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Compte administrateur disponible</CardTitle>
            <p className="text-gray-600 mt-2">
              Le compte administrateur est déjà configuré et prêt à être utilisé.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informations du compte */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Identifiants administrateur
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">Email :</span>
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">admin@example.com</code>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">Mot de passe :</span>
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">admin123</code>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Comment se connecter :</h3>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Allez sur la page de connexion</li>
                <li>Sélectionnez le mode "Admin"</li>
                <li>Utilisez les identifiants ci-dessus</li>
                <li>Cliquez sur "Se connecter (Admin)"</li>
              </ol>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Shield className="mr-2 h-4 w-4" />
                Se connecter en tant qu'admin
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
          
          <CardFooter>
            <p className="text-xs text-center w-full text-gray-500">
              Ce compte a tous les droits d'administration sur la plateforme.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
