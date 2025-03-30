
import React from 'react';
import ResultItem from '@/components/test-results/ResultItem';
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
        <h3 className="text-lg font-semibold mb-2">Analyses approfondies</h3>
        {hasPaid ? (
          <div>
            {results.aiInsights ? (
              <ResultItem 
                itemKey="aiInsights" 
                value={results.aiInsights} 
                index={0} 
                hasPaid={true}
                testType={testType}
              />
            ) : (
              <p className="text-gray-500">Analyses IA non disponibles pour ce test.</p>
            )}
          </div>
        ) : (
          <PaymentPrompt 
            isProcessingPayment={isProcessingPayment} 
            onPayment={onPayment}
          />
        )}
      </div>
    </div>
  );
};

export default ResultsInsightsTab;
