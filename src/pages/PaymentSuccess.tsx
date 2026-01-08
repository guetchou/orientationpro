
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const { success } = useToast();
  
  useEffect(() => {
    success("Paiement effectué avec succès!");
    
    // Simulate loading results
    const timer = setTimeout(() => {
      // In a real app, this would be where you load the test results
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-2 border-green-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          
          <CardHeader className="text-center pb-2">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 rounded-full bg-green-50 border border-green-100">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl sm:text-3xl font-bold text-green-600">
              Paiement réussi
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-gray-600 mb-6">
                Votre paiement a été traité avec succès. Vous avez maintenant accès à tous vos résultats de test détaillés.
              </p>
              
              <div className="p-4 bg-green-50 rounded-lg mb-6 text-left">
                <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Ce que vous avez débloqué:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Analyse détaillée de votre profil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Recommandations personnalisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Export PDF de vos résultats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Accès à notre base de données d'orientation</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/test-results">
                    <BarChart size={18} />
                    Voir mes résultats
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/dashboard">
                    <Home size={18} />
                    Tableau de bord
                  </Link>
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
