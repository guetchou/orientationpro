import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-red-200">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-red-700">
                Accès non autorisé
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Accès refusé</span>
              </div>
              <p className="text-sm text-red-600 mt-2">
                Cette page nécessite des permissions spéciales. Veuillez vous connecter avec un compte approprié.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
              
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Besoin d'aide ? Contactez l'administrateur.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 