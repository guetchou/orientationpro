
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { AIEnhancedAnalysis } from '@/types/test';

/**
 * Extracts the most relevant keywords from test results
 */
export const extractKeywords = (testResults: any): string[] => {
  // This is a simplified implementation
  const keywords = [];
  
  if (testResults.personalityCode) {
    keywords.push(testResults.personalityCode);
  }
  
  if (testResults.dominantTypes) {
    keywords.push(...testResults.dominantTypes);
  }
  
  return keywords;
};

/**
 * Generates career suggestions based on test results
 */
export const generateCareerSuggestions = async (testType: string, testResults: any): Promise<string[]> => {
  try {
    // This would call an API in production
    // For now, we'll return mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const suggestions = [
      "Développeur web",
      "Analyste de données",
      "Gestionnaire de projet",
      "Consultant en marketing",
      "Chercheur en IA"
    ];
    
    return suggestions;
  } catch (error) {
    console.error("Error generating career suggestions:", error);
    toast.error("Impossible de générer des suggestions de carrière");
    return [];
  }
};

/**
 * Compares test results with previous tests to show progress
 */
export const compareWithPreviousTests = async (userId: string, testType: string, currentResults: any): Promise<any> => {
  try {
    if (!userId) return null;
    
    const { data: previousTests, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('test_type', testType)
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (error) throw error;
    
    // If there's only one test (the current one), no comparison possible
    if (!previousTests || previousTests.length <= 1) {
      return null;
    }
    
    // The current test should be the most recent, so compare with the second result
    const previousTest = previousTests[1]; 
    const previousResults = previousTest.results;
    
    // Calculate differences based on test type
    const comparison = {
      improvements: [],
      declines: []
    };
    
    // This is a simplified implementation
    // In a real app, we'd have more sophisticated comparison logic
    
    return comparison;
  } catch (error) {
    console.error("Error comparing with previous tests:", error);
    return null;
  }
};

/**
 * Generates AI enhanced insights for the test results
 */
export const getInsights = async (testType: string, testResults: any): Promise<AIEnhancedAnalysis> => {
  try {
    // In production, this would call an API endpoint
    // For now, we generate mock insights
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let insights: AIEnhancedAnalysis = {
      strengths: [
        "Capacité d'adaptation",
        "Résolution de problèmes"
      ],
      weaknesses: [
        "Gestion du temps",
        "Communication écrite"
      ],
      recommendations: [
        "Suivre une formation en gestion du temps",
        "Pratiquer l'écriture régulièrement"
      ],
      analysis: "Vos résultats indiquent que vous avez une bonne capacité d'adaptation et de résolution de problèmes. Cependant, vous pourriez améliorer votre gestion du temps et votre communication écrite.",
      confidenceScore: 85
    };
    
    // Add career suggestions for certain test types
    if (['riasec', 'career_transition', 'no_diploma'].includes(testType)) {
      insights.careerSuggestions = await generateCareerSuggestions(testType, testResults);
    }
    
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    toast.error("Impossible de générer des insights");
    
    // Return basic insights as fallback
    return {
      strengths: ["Adaptabilité"],
      weaknesses: ["Analyse à compléter"],
      recommendations: ["Réessayer l'analyse plus tard"],
      analysis: "Nous n'avons pas pu compléter l'analyse approfondie de vos résultats. Veuillez réessayer ultérieurement.",
      confidenceScore: 60
    };
  }
};
