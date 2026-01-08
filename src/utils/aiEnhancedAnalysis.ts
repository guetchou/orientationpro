
import axios from 'axios';
import { AIEnhancedAnalysis } from '@/types/test';

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
    
    // Use backend API directly (migrated from Supabase)
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) throw new Error('VITE_BACKEND_URL doit être défini dans .env');
    
    const response = await axios.post(`${backendUrl}/api/ats/tests/analyze`, {
      testType,
      results
    }, {
      withCredentials: true,
      timeout: 30000 // 30 seconds timeout since AI analysis can take time
    });
    
    if (response.data) {
      console.log("AI analysis generated successfully via backend API");
      // Map backend response to frontend interface
      const backendData = response.data;
      return {
        strengths: backendData.personalityInsights?.slice(0, 3) || [],
        weaknesses: backendData.strengthWeaknessAnalysis?.filter((s: string) => s.includes('améliorer')) || [],
        recommendations: backendData.careerRecommendations || [],
        developmentSuggestions: backendData.developmentSuggestions || [],
        learningPathways: backendData.learningPathways || [],
        analysis: backendData.personalityInsights?.join(' ') || "Analyse générée avec succès",
        confidenceScore: backendData.confidenceScore || 80
      };
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
