
import React from 'react';
import AIInsightsPanel from '@/components/test-results/AIInsightsPanel';
import PaymentPrompt from '@/components/test-results/PaymentPrompt';

interface ResultsInsightsTabProps {
  results: any;
  hasPaid: boolean;
  isProcessingPayment: boolean;
  onPayment: () => Promise<void>;
  testType: string;
}

const ResultsInsightsTab = ({
  results,
  hasPaid,
  isProcessingPayment,
  onPayment,
  testType
}: ResultsInsightsTabProps) => {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Analyses approfondies</h3>
        
        {hasPaid ? (
          <>
            {results.aiInsights ? (
              <AIInsightsPanel 
                testType={testType}
                analysis={results.aiInsights}
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                <p className="text-gray-500 mb-4">Analyse approfondie non disponible pour ce test.</p>
                <p className="text-sm text-gray-400">Notre système n'a pas pu générer d'analyse supplémentaire. Veuillez contacter le support si ce problème persiste.</p>
              </div>
            )}
            
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Comment interpréter ces résultats ?</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Ces analyses sont générées par notre système d'IA pour vous aider à mieux comprendre vos résultats.
                Elles identifient vos forces, vos domaines d'amélioration et vous offrent des recommandations personnalisées
                pour votre développement professionnel.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-4 blur-sm pointer-events-none">
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Analyse avancée de votre profil</h4>
                <p>Cette analyse détaillée révèle vos forces spécifiques et comment les exploiter...</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Point fort identifié : ...</li>
                  <li>Potentiel de développement : ...</li>
                  <li>Domaines de prédilection : ...</li>
                </ul>
              </div>
            </div>
            
            <PaymentPrompt 
              isProcessingPayment={isProcessingPayment} 
              onPayment={onPayment}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsInsightsTab;
