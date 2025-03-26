
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ResultItem from '@/components/test-results/ResultItem';
import PaymentPrompt from '@/components/test-results/PaymentPrompt';
import ResultsActions from '@/components/test-results/ResultsActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FileText, ChartBar, Brain, Star } from "lucide-react";

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
  const testType = testResults.test_type || 'orientation';

  // Groupe les résultats par catégorie pour un affichage plus organisé
  const groupedResults = {
    scores: Object.entries(results).filter(([key]) => 
      typeof results[key] === 'number' && !key.includes('confidence') && !key.includes('interest')
    ),
    recommendations: Object.entries(results).filter(([key]) => 
      Array.isArray(results[key]) && (key.includes('recommended') || key.includes('paths'))
    ),
    metrics: Object.entries(results).filter(([key]) => 
      typeof results[key] === 'number' && (key.includes('interest') || key.includes('potential'))
    ),
    insights: Object.entries(results).filter(([key]) => 
      typeof results[key] === 'object' && !Array.isArray(results[key]) && key.includes('insights')
    )
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Résultats du Test</CardTitle>
          <CardDescription>
            {hasPaid 
              ? "Voici vos résultats détaillés complets basés sur vos réponses." 
              : "Voici un aperçu de vos résultats. Obtenez l'analyse complète en débloquant le rapport."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-4 rounded-none">
              <TabsTrigger value="overview" className="data-[state=active]:bg-teal-50 dark:data-[state=active]:bg-teal-900/20">
                <FileText className="h-4 w-4 mr-2" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="scores" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20">
                <ChartBar className="h-4 w-4 mr-2" />
                Scores
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/20">
                <Star className="h-4 w-4 mr-2" />
                Recommandations
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20">
                <Brain className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-6">
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
            </TabsContent>
            
            <TabsContent value="scores" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Vos scores détaillés</h3>
                {!hasPaid && index > 2 && (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {groupedResults.scores.slice(0, 2).map(([key, value]: [string, any], index) => (
                      <ResultItem 
                        key={key} 
                        itemKey={key} 
                        value={value} 
                        index={index} 
                        hasPaid={true}
                        testType={testType}
                      />
                    ))}
                  </div>
                )}
                
                {(hasPaid || !groupedResults.scores.length) ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {groupedResults.scores.map(([key, value]: [string, any], index) => (
                      <ResultItem 
                        key={key} 
                        itemKey={key} 
                        value={value} 
                        index={index} 
                        hasPaid={true}
                        testType={testType}
                      />
                    ))}
                    {groupedResults.metrics.map(([key, value]: [string, any], index) => (
                      <ResultItem 
                        key={key} 
                        itemKey={key} 
                        value={value} 
                        index={index} 
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
            </TabsContent>
            
            <TabsContent value="recommendations" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Recommandations personnalisées</h3>
                {hasPaid ? (
                  <div className="grid gap-4 grid-cols-1">
                    {groupedResults.recommendations.map(([key, value]: [string, any], index) => (
                      <ResultItem 
                        key={key} 
                        itemKey={key} 
                        value={value} 
                        index={index} 
                        hasPaid={true}
                        testType={testType}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="opacity-50 pointer-events-none">
                      {groupedResults.recommendations.slice(0, 1).map(([key, value]: [string, any], index) => (
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
            </TabsContent>
            
            <TabsContent value="insights" className="p-6">
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
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="p-6">
            {hasPaid && <ResultsActions />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultsView;
