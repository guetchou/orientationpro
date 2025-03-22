
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ResultItem from '@/components/test-results/ResultItem';
import PaymentPrompt from '@/components/test-results/PaymentPrompt';
import ResultsActions from '@/components/test-results/ResultsActions';

interface TestResultsViewProps {
  testResults: any;
  hasPaid: boolean;
  isProcessingPayment: boolean;
  onPayment: () => Promise<void>;
}

const TestResultsView = ({
  testResults,
  hasPaid,
  isProcessingPayment,
  onPayment
}: TestResultsViewProps) => {
  const results = testResults.results || {};

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Résultats du Test</CardTitle>
          <CardDescription>
            {hasPaid 
              ? "Voici vos résultats détaillés complets." 
              : "Voici un aperçu de vos résultats. Obtenez l'analyse complète en débloquant le rapport."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(results).map(([key, value]: [string, any], index) => (
            <ResultItem 
              key={key} 
              itemKey={key} 
              value={value} 
              index={index} 
              hasPaid={hasPaid} 
            />
          ))}

          {!hasPaid && (
            <PaymentPrompt 
              isProcessingPayment={isProcessingPayment} 
              onPayment={onPayment}
            />
          )}

          {hasPaid && <ResultsActions />}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultsView;
