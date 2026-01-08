
import React from 'react';
import { Button } from "@/components/ui/button";

interface PaymentPromptProps {
  isProcessingPayment: boolean;
  onPayment: () => void;
}

const PaymentPrompt = ({ isProcessingPayment, onPayment }: PaymentPromptProps) => {
  return (
    <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
      <h3 className="text-lg font-semibold mb-2 text-center">Débloquer le rapport complet</h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Accédez à l'analyse détaillée de vos résultats et obtenez des recommandations personnalisées pour votre orientation.
      </p>
      <div className="flex justify-center">
        <Button 
          onClick={onPayment} 
          disabled={isProcessingPayment}
          className="px-6"
        >
          {isProcessingPayment ? "Traitement en cours..." : "Payer 3500 FC pour le rapport complet"}
        </Button>
      </div>
      <p className="text-xs text-center mt-4 text-gray-500">
        Paiement sécurisé par Airtel Money, MTN Mobile Money ou carte bancaire
      </p>
    </div>
  );
};

export default PaymentPrompt;
