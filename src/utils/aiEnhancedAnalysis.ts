
import axios from 'axios';
import { 
  AIEnhancedAnalysis,
  TestResults
} from "@/types/test";
import { analyzeTestResults } from './analysis/analyzeTestResults';
import { generateSuggestions } from './analysis/generateSuggestions';

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Cette fonction appelle le backend pour analyser les résultats de test avec l'IA
export const getAIEnhancedAnalysis = async (
  testType: string, 
  results: TestResults
): Promise<AIEnhancedAnalysis> => {
  try {
    // Appel de l'API backend
    const response = await axios.post(`${backendUrl}/api/analyze-test-results`, {
      testType,
      results
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'analyse IA:", error);
    // Fallback en cas d'erreur - fournir une analyse de base
    return {
      personalityInsights: [
        "Notre système a rencontré un problème lors de l'analyse approfondie de vos résultats.",
        "Vous pouvez toujours consulter vos résultats standards qui sont fiables."
      ],
      careerRecommendations: [],
      learningPathways: [],
      strengthWeaknessAnalysis: [],
      developmentSuggestions: [],
      confidenceScore: (results as any).confidenceScore || 75
    };
  }
};

// Suggère des améliorations basées sur un profil d'utilisateur
export const suggestImprovements = async (userId: string): Promise<string[]> => {
  try {
    // Récupérer l'historique des tests de l'utilisateur depuis le backend
    const response = await axios.get(`${backendUrl}/api/users/${userId}/test-history`);
    const testHistory = response.data;
    
    return generateSuggestions(testHistory);
  } catch (error) {
    console.error("Erreur lors de la génération de suggestions:", error);
    return [
      "Essayez différents tests pour obtenir une vue complète de vos compétences et préférences",
      "Refaites les tests périodiquement pour suivre votre évolution"
    ];
  }
};
