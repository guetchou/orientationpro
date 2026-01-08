
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, CreditCard, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const PaymentCancel = () => {
  const { warning } = useToast();
  
  useEffect(() => {
    warning("Le paiement a été annulé.");
  }, [warning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-2 border-red-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-pink-500"></div>
          
          <CardHeader className="text-center pb-2">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 rounded-full bg-red-50 border border-red-100">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl sm:text-3xl font-bold text-red-600">
              Paiement annulé
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-gray-600 mb-6">
                Votre paiement a été annulé. Si vous avez rencontré des problèmes, n'hésitez pas à contacter notre service client.
              </p>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-6 text-left">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <HelpCircle size={18} />
                  Raisons possibles:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Annulation volontaire du paiement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Problème temporaire avec votre moyen de paiement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Interruption de la connexion internet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Délai de traitement dépassé</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/payment">
                    <CreditCard size={18} />
                    Réessayer
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/dashboard">
                    <Home size={18} />
                    Retour au tableau de bord
                  </Link>
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>Besoin d'aide? <Link to="/contact" className="text-primary underline">Contactez notre support</Link></p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
