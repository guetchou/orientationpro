
import React from 'react';
import ResultItem from '@/components/test-results/ResultItem';
import PaymentPrompt from '@/components/test-results/PaymentPrompt';

interface ResultsScoresTabProps {
  groupedResults: any;
  hasPaid: boolean;
  isProcessingPayment: boolean;
  onPayment: () => Promise<void>;
  testType: string;
}

const ResultsScoresTab = ({
  groupedResults,
  hasPaid,
  isProcessingPayment,
  onPayment,
  testType
}: ResultsScoresTabProps) => {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Vos scores détaillés</h3>
        {!hasPaid && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {groupedResults.scores.slice(0, 2).map(([key, value]: [string, any], viewIndex) => (
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
        )}
        
        {(hasPaid || !groupedResults.scores.length) ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {groupedResults.scores.map(([key, value]: [string, any], viewIndex) => (
              <ResultItem 
                key={key} 
                itemKey={key} 
                value={value} 
                index={viewIndex} 
                hasPaid={true}
                testType={testType}
              />
            ))}
            {groupedResults.metrics.map(([key, value]: [string, any], viewIndex) => (
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
          <PaymentPrompt 
            isProcessingPayment={isProcessingPayment} 
            onPayment={onPayment}
          />
        )}
      </div>
    </div>
  );
};

export default ResultsScoresTab;
