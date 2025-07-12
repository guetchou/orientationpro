
import axios from 'axios';
import { AIEnhancedAnalysis } from '@/types/test';
import { supabase } from '@/integrations/supabase/client';

const fallbackAnalysis: AIEnhancedAnalysis = {
  strengths: ["Auto-connaissance", "Capacité d'adaptation"],
  weaknesses: ["Point à améliorer : confiance en soi", "Point à améliorer : organisation"],
  recommendations: ["Explorer des formations dans votre domaine d'intérêt", "Consulter un conseiller professionnel"],
  developmentSuggestions: ["Suivre des cours en ligne", "Rejoindre des groupes professionnels"],
  learningPathways: ["Formation autodidacte", "Mentorat"],
  analysis: "Analyse de secours pour vos résultats. Nous avons identifié quelques forces et points d'amélioration potentiels.",
  confidenceScore: 75
};

export const getAIEnhancedAnalysis = async (testType: string, results: any): Promise<AIEnhancedAnalysis> => {
  try {
    console.log(`Generating AI analysis for ${testType} test...`);
    
    // Try to use Supabase Edge Function if available
    try {
      const { data: aiData, error } = await supabase.functions.invoke('analyze-test-results', {
        body: { testType, results }
      });
      
      if (!error && aiData) {
        console.log("AI analysis generated successfully via Supabase");
        return {
          strengths: aiData.personalityInsights?.slice(0, 3) || [],
          weaknesses: aiData.strengthWeaknessAnalysis?.filter(s => s.includes('améliorer')) || [],
          recommendations: aiData.careerRecommendations || [],
          developmentSuggestions: aiData.developmentSuggestions || [],
          learningPathways: aiData.learningPathways || [],
          analysis: aiData.personalityInsights?.join(' ') || "Analyse générée avec succès",
          confidenceScore: aiData.confidenceScore || 80
        };
      }
    } catch (supabaseError) {
      console.warn("Supabase Edge Function failed, falling back to backend API:", supabaseError);
    }
    
    // Fallback to backend API if Supabase Edge Function is not available
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) throw new Error('VITE_BACKEND_URL doit être défini dans .env');
    
    const response = await axios.post(`${backendUrl}/api/ai-analysis/analyze`, {
      testType,
      results
    }, {
      withCredentials: true,
      timeout: 30000 // 30 seconds timeout since AI analysis can take time
    });
    
    if (response.data) {
      console.log("AI analysis generated successfully via backend API");
      return response.data;
    }
    
    throw new Error("No valid response from AI analysis services");
  } catch (error) {
    console.error("Failed to generate AI analysis:", error);
    
    // If we have some test type specific feedback in the results, use it
    if (results) {
      const enhancedFallback = { ...fallbackAnalysis };
      
      // Customize fallback based on test type
      switch (testType) {
        case 'riasec':
          enhancedFallback.recommendations = results.dominantTypes ? 
            [`Explorer des carrières liées au profil ${results.dominantTypes.join('')}`, 
             "Consulter un conseiller d'orientation"] : 
            fallbackAnalysis.recommendations;
          break;
        case 'learning_style':
          enhancedFallback.recommendations = results.primary ? 
            [`Privilégier des méthodes d'apprentissage ${results.primary.toLowerCase()}`,
             "Diversifier vos approches éducatives"] : 
            fallbackAnalysis.recommendations;
          break;
      }
      
      return enhancedFallback;
    }
    
    return fallbackAnalysis;
  }
};
