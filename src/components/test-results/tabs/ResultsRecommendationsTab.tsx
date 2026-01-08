
import React from 'react';
import ResultItem from '@/components/test-results/ResultItem';
import PaymentPrompt from '@/components/test-results/PaymentPrompt';

interface ResultsRecommendationsTabProps {
  groupedResults: any;
  hasPaid: boolean;
  isProcessingPayment: boolean;
  onPayment: () => Promise<void>;
  testType: string;
}

const ResultsRecommendationsTab = ({
  groupedResults,
  hasPaid,
  isProcessingPayment,
  onPayment,
  testType
}: ResultsRecommendationsTabProps) => {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Recommandations personnalisées</h3>
        {hasPaid ? (
          <div className="grid gap-4 grid-cols-1">
            {groupedResults.recommendations.map(([key, value]: [string, any], viewIndex) => (
              <ResultItem 
                key={key} 
                itemKey={key} 
                value={value} 
                index={viewIndex} 
                hasPaid={true}
                testType={testType}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="opacity-50 pointer-events-none">
              {groupedResults.recommendations.slice(0, 1).map(([key, value]: [string, any]) => (
                <ResultItem 
                  key={key} 
                  itemKey={key} 
                  value={value} 
                  index={3} // Force blurring
                  hasPaid={false}
                  testType={testType}
                />
              ))}
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

export default ResultsRecommendationsTab;
