
import { supabase } from "@/integrations/supabase/client";
import { AIEnhancedAnalysis } from "@/types/test";

/**
 * Obtient l'analyse avancée des résultats de tests par IA
 * @param testType Le type de test
 * @param results Les résultats du test à analyser
 */
export async function getAIEnhancedAnalysis(
  testType: string, 
  results: any
): Promise<AIEnhancedAnalysis> {
  try {
    console.log(`Generating AI analysis for ${testType} test...`);

    // Appelle la fonction Edge de Supabase pour l'analyse
    const { data, error } = await supabase.functions.invoke("analyze-test-results", {
      body: { testType, results }
    });
    
    if (error) {
      console.error("Error from analyze-test-results function:", error);
      throw error;
    }
    
    // Format the received analysis
    const formattedAnalysis: AIEnhancedAnalysis = {
      strengths: data.personalityInsights || [],
      weaknesses: data.strengthWeaknessAnalysis?.filter((item: string) => 
        item.toLowerCase().includes("améliorer")
      ) || [],
      recommendations: data.careerRecommendations || [],
      developmentSuggestions: data.developmentSuggestions || [],
      learningPathways: data.learningPathways || [],
      analysis: `Analyse basée sur vos résultats du test ${testType.toUpperCase()}. Cette analyse a identifié vos forces principales et axes d'amélioration, avec des recommandations personnalisées.`,
      confidenceScore: data.confidenceScore || 85
    };
    
    return formattedAnalysis;
  } catch (error) {
    console.error("Error in AI analysis:", error);
    
    // Fournit une analyse par défaut pour éviter les erreurs
    return {
      strengths: ["Analyse IA non disponible"],
      weaknesses: ["Analyse IA non disponible"],
      recommendations: ["Veuillez réessayer ultérieurement"],
      analysis: "Une erreur s'est produite lors de l'analyse des résultats du test.",
      confidenceScore: 0
    };
  }
}
