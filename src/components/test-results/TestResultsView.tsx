
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ChartBar, Brain, Star } from "lucide-react";
import { useTestAnalysis } from "@/hooks/useTestAnalysis";
import ResultsOverviewTab from './tabs/ResultsOverviewTab';
import ResultsScoresTab from './tabs/ResultsScoresTab';
import ResultsRecommendationsTab from './tabs/ResultsRecommendationsTab';
import ResultsInsightsTab from './tabs/ResultsInsightsTab';
import ResultsActions from '@/components/test-results/ResultsActions';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

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
  const [isLoadingInsights, setIsLoadingInsights] = useState(hasPaid && !results.aiInsights);
  const [processedResults, setProcessedResults] = useState(results);
  
  // Utilise le hook pour l'analyse
  const { generateAnalysis, isAnalyzing } = useTestAnalysis({
    testId: testResults.id,
    testType,
    results
  });
  
  // Assurer que tous les résultats sont correctement traités pour l'affichage
  useEffect(() => {
    // Si les résultats n'ont pas de propriétés spécifiques, les ajouter
    const enhanced = {...results};
    
    if (testType === 'learning_style' && !enhanced.recommendations) {
      enhanced.recommendations = [
        "Adapter vos méthodes d'étude à votre style d'apprentissage", 
        "Utiliser des outils adaptés à votre style préférentiel"
      ];
    }
    
    if (testType === 'emotional' && !enhanced.strengths) {
      enhanced.strengths = ["Conscience de soi", "Gestion des émotions"];
      enhanced.areasToImprove = ["Communication émotionnelle"];
    }
    
    setProcessedResults(enhanced);
  }, [results, testType]);
  
  // Regroupement des résultats par catégorie pour un affichage plus organisé
  const groupedResults = {
    scores: Object.entries(processedResults).filter(([key]) => 
      typeof processedResults[key] === 'number' && !key.includes('confidence') && !key.includes('interest')
    ),
    recommendations: Object.entries(processedResults).filter(([key]) => 
      Array.isArray(processedResults[key]) && (key.includes('recommended') || key.includes('paths') || key.includes('recommendations'))
    ),
    metrics: Object.entries(processedResults).filter(([key]) => 
      typeof processedResults[key] === 'number' && (key.includes('interest') || key.includes('potential') || key.includes('score'))
    ),
    insights: Object.entries(processedResults).filter(([key]) => 
      typeof processedResults[key] === 'object' && !Array.isArray(processedResults[key]) && key.includes('insights')
    )
  };
  
  // Génère les insights si l'utilisateur a payé et qu'ils n'existent pas encore
  useEffect(() => {
    const loadInsights = async () => {
      if (hasPaid && !results.aiInsights) {
        try {
          setIsLoadingInsights(true);
          const analysis = await generateAnalysis();
          
          // Mettre à jour les résultats traités avec l'analyse générée
          setProcessedResults(prev => ({
            ...prev,
            aiInsights: analysis
          }));
          
          toast.success("Analyse IA générée avec succès");
        } catch (error) {
          console.error("Erreur lors de la génération de l'analyse IA:", error);
          toast.error("Impossible de générer l'analyse IA");
        } finally {
          setIsLoadingInsights(false);
        }
      }
    };
    
    loadInsights();
  }, [hasPaid, results.aiInsights]);

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
            
            {isLoadingInsights || isAnalyzing ? (
              <div className="p-10 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-36 w-full" />
                <div className="text-center text-gray-500 mt-4">
                  Génération de votre analyse personnalisée...
                </div>
              </div>
            ) : (
              <>
                <TabsContent value="overview">
                  <ResultsOverviewTab 
                    results={processedResults} 
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
                    results={processedResults}
                    hasPaid={hasPaid}
                    isProcessingPayment={isProcessingPayment}
                    onPayment={onPayment}
                    testType={testType}
                  />
                </TabsContent>
              </>
            )}
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
