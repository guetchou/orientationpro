
import React from 'react';
import ResultItem from '@/components/test-results/ResultItem';
import PaymentPrompt from '@/components/test-results/PaymentPrompt';

interface ResultsOverviewTabProps {
  results: any;
  groupedResults: any;
  hasPaid: boolean;
  isProcessingPayment: boolean;
  onPayment: () => Promise<void>;
  testType: string;
}

const ResultsOverviewTab = ({
  results,
  hasPaid,
  isProcessingPayment,
  onPayment,
  testType
}: ResultsOverviewTabProps) => {
  return (
    <div className="p-6">
      <div className="space-y-6">
        {!hasPaid && (
          <PaymentPrompt 
            isProcessingPayment={isProcessingPayment} 
            onPayment={onPayment}
          />
        )}
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Object.entries(results).slice(0, 4).map(([key, value]: [string, any], index) => (
            <ResultItem 
              key={key} 
              itemKey={key} 
              value={value} 
              index={index} 
              hasPaid={hasPaid}
              testType={testType}
            />
          ))}
        </div>
        
        {hasPaid && (
          <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <h3 className="font-medium mb-2">Consultez tous les onglets pour voir l'analyse complète</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nous avons analysé vos réponses en profondeur. Consultez chaque onglet pour explorer les différents aspects de vos résultats.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsOverviewTab;
