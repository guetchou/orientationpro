
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { AIEnhancedAnalysis } from "@/types/test";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";

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
      
      // Obtenir l'analyse IA depuis notre utilitaire
      const aiAnalysis = await getAIEnhancedAnalysis(testType, results);
      setAnalysis(aiAnalysis);
      
      // Si nous avons un ID de test, mettre à jour le résultat du test avec l'analyse
      if (testId) {
        const { error: updateError } = await supabase
          .from('test_results')
          .update({ 
            results: {
              ...results,
              aiInsights: aiAnalysis 
            }
          })
          .eq('id', testId);
          
        if (updateError) {
          console.error("Error updating test results with analysis:", updateError);
          toast.error("Erreur lors de la mise à jour des résultats du test");
        } else {
          toast.success("Analyse générée avec succès");
        }
      }
      
      return aiAnalysis;
    } catch (error: any) {
      console.error("Error generating AI analysis:", error);
      toast.error("Erreur lors de la génération de l'analyse");
      
      // Fournir une analyse de secours
      const fallbackAnalysis: AIEnhancedAnalysis = {
        strengths: ["Auto-connaissance", "Capacité d'adaptation"],
        weaknesses: ["Point à améliorer : confiance en soi", "Point à améliorer : organisation"],
        recommendations: ["Explorer des formations dans votre domaine d'intérêt", "Consulter un conseiller professionnel"],
        developmentSuggestions: ["Suivre des cours en ligne", "Rejoindre des groupes professionnels"],
        learningPathways: ["Formation autodidacte", "Mentorat"],
        analysis: `Analyse de secours pour vos résultats du test ${testType.toUpperCase()}. Nous avons identifié quelques forces et points d'amélioration potentiels.`,
        confidenceScore: 75
      };
      
      setAnalysis(fallbackAnalysis);
      return fallbackAnalysis;
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
