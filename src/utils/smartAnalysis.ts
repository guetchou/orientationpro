import { supabase } from "@/lib/supabaseClient";
import { TestResult, AIEnhancedAnalysis } from "@/types/test";

/**
 * Analyze test results with AI to generate enhanced insights
 * @param testResults The test results to analyze
 */
export async function analyzeWithAI(testResults: TestResult): Promise<AIEnhancedAnalysis> {
  try {
    console.log("Analyzing test results with AI:", testResults.test_type);
    
    // In a production environment, you would call an AI service here
    // For this demo, we'll return mock data
    
    const strengths = generateStrengths(testResults);
    const weaknesses = generateWeaknesses(testResults);
    const recommendations = generateRecommendations(testResults);
    const careerSuggestions = testResults.test_type === 'riasec' 
      ? generateCareerSuggestions(testResults) 
      : undefined;
    
    const analysis = `Analyse basée sur vos résultats du test ${testResults.test_type.toUpperCase()}. 
    Cette analyse a identifié ${strengths.length} points forts et ${weaknesses.length} points à améliorer, 
    avec ${recommendations.length} recommandations personnalisées.`;
    
    const aiAnalysis: AIEnhancedAnalysis = {
      strengths,
      weaknesses,
      recommendations,
      careerSuggestions,
      analysis,
      confidenceScore: 85
    };
    
    // Save the analysis to the database
    await saveAnalysisToDatabase(testResults, aiAnalysis);
    
    return aiAnalysis;
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return {
      strengths: ["Analyse non disponible"],
      weaknesses: ["Analyse non disponible"],
      recommendations: ["Veuillez réessayer ultérieurement"],
      analysis: "Une erreur s'est produite lors de l'analyse des résultats du test.",
      confidenceScore: 0
    };
  }
}

// Helper function to save analysis to database
async function saveAnalysisToDatabase(testResults: TestResult, analysis: AIEnhancedAnalysis) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    if (!userId) return;
    
    await supabase.from('ai_analyses').insert({
      user_id: userId,
      test_id: testResults.id,
      test_type: testResults.test_type,
      analysis_data: analysis,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving AI analysis to database:", error);
  }
}

// Mock functions to generate analysis data
function generateStrengths(testResults: TestResult): string[] {
  switch (testResults.test_type) {
    case 'riasec':
      return [
        "Capacité d'analyse et de résolution de problèmes",
        "Aptitude à travailler de manière autonome",
        "Persévérance et détermination"
      ];
    case 'emotional':
      return [
        "Bonne gestion du stress",
        "Capacité d'empathie développée",
        "Communication efficace"
      ];
    default:
      return ["Points forts à déterminer"];
  }
}

function generateWeaknesses(testResults: TestResult): string[] {
  switch (testResults.test_type) {
    case 'riasec':
      return [
        "Pourrait développer davantage ses compétences en leadership",
        "Tendance à être perfectionniste"
      ];
    case 'emotional':
      return [
        "Pourrait améliorer sa gestion des émotions négatives",
        "Tendance à éviter les conflits"
      ];
    default:
      return ["Points à améliorer à déterminer"];
  }
}

function generateRecommendations(testResults: TestResult): string[] {
  switch (testResults.test_type) {
    case 'riasec':
      return [
        "Explorer des formations en lien avec vos intérêts dominants",
        "Rencontrer des professionnels dans les domaines qui vous intéressent",
        "Participer à des ateliers de développement personnel"
      ];
    case 'emotional':
      return [
        "Pratiquer la pleine conscience pour améliorer votre conscience émotionnelle",
        "Suivre des formations en communication interpersonnelle",
        "Tenir un journal de vos émotions"
      ];
    default:
      return ["Recommandations personnalisées non disponibles"];
  }
}

function generateCareerSuggestions(testResults: TestResult): string[] {
  if (testResults.test_type === 'riasec') {
    return [
      "Ingénieur en développement logiciel",
      "Analyste de données",
      "Chercheur scientifique",
      "Consultant en management"
    ];
  }
  
  return [];
}
