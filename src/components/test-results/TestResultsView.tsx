
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ChartBar, Brain, Star } from "lucide-react";
import ResultsOverviewTab from './tabs/ResultsOverviewTab';
import ResultsScoresTab from './tabs/ResultsScoresTab';
import ResultsRecommendationsTab from './tabs/ResultsRecommendationsTab';
import ResultsInsightsTab from './tabs/ResultsInsightsTab';
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
            
            <TabsContent value="overview">
              <ResultsOverviewTab 
                results={results} 
                groupedResults={groupedResults}
                hasPaid={hasPaid} 
                isProcessingPayment={isProcessingPayment}
                onPayment={onPayment}
                testType={testType}
              />
            </TabsContent>
            
            <TabsContent value="scores">
              <ResultsScoresTab 
                groupedResults={groupedResults}
                hasPaid={hasPaid}
                isProcessingPayment={isProcessingPayment}
                onPayment={onPayment}
                testType={testType}
              />
            </TabsContent>
            
            <TabsContent value="recommendations">
              <ResultsRecommendationsTab 
                groupedResults={groupedResults}
                hasPaid={hasPaid}
                isProcessingPayment={isProcessingPayment}
                onPayment={onPayment}
                testType={testType}
              />
            </TabsContent>
            
            <TabsContent value="insights">
              <ResultsInsightsTab 
                results={results}
                hasPaid={hasPaid}
                isProcessingPayment={isProcessingPayment}
                onPayment={onPayment}
                testType={testType}
              />
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
