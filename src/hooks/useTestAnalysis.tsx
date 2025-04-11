
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIEnhancedAnalysis } from "@/types/test";

interface TestAnalysisOptions {
  testId?: string;
  testType: string;
  results: any;
}

export function useTestAnalysis({ testId, testType, results }: TestAnalysisOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIEnhancedAnalysis | null>(null);
  
  const generateAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      // Call the Supabase Edge Function to analyze results
      const { data, error } = await supabase.functions.invoke("analyze-test-results", {
        body: { testType, results }
      });
      
      if (error) throw new Error(error.message);
      
      // Format the received analysis
      const formattedAnalysis: AIEnhancedAnalysis = {
        strengths: data.personalityInsights || [],
        weaknesses: data.strengthWeaknessAnalysis?.filter((item: string) => 
          item.toLowerCase().includes("améliorer")
        ) || [],
        recommendations: data.careerRecommendations || [],
        developmentSuggestions: data.developmentSuggestions || [],
        learningPathways: data.learningPathways || [],
        analysis: `Analyse basée sur vos résultats du test ${testType.toUpperCase()}. Cette analyse a identifié vos forces et axes d'amélioration, avec des recommandations personnalisées.`,
        confidenceScore: data.confidenceScore || 75
      };
      
      setAnalysis(formattedAnalysis);
      
      // If we have a test ID, update the test result with the analysis
      if (testId) {
        const { error: updateError } = await supabase
          .from('test_results')
          .update({ 
            results: {
              ...results,
              aiInsights: formattedAnalysis 
            }
          })
          .eq('id', testId);
          
        if (updateError) {
          console.error("Error updating test results with analysis:", updateError);
        }
      }
      
      return formattedAnalysis;
    } catch (error: any) {
      console.error("Error generating AI analysis:", error);
      toast.error("Erreur lors de la génération de l'analyse");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return {
    generateAnalysis,
    isAnalyzing,
    analysis
  };
}
