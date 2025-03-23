
import { supabase } from "@/lib/supabaseClient";
import { AIEnhancedAnalysis } from "@/types/test";

/**
 * Get AI enhanced analysis for a test result
 * @param testType The type of test
 * @param results The test results
 */
export async function getAIEnhancedAnalysis(testType: string, results: any): Promise<AIEnhancedAnalysis> {
  try {
    // Simulate an AI analysis (in a real app, you'd call an AI service)
    const mockAnalysis: AIEnhancedAnalysis = {
      strengths: generateStrengths(testType, results),
      weaknesses: generateWeaknesses(testType, results),
      recommendations: generateRecommendations(testType, results),
      careerSuggestions: generateCareerSuggestions(testType, results),
      analysis: generateAnalysis(testType, results),
      confidenceScore: 85
    };

    // In a production environment, you'd send the results to your AI model
    // and get back the analysis
    
    // Mock saving the AI analysis to the database
    await saveAnalysisToDatabase(testType, results, mockAnalysis);
    
    return mockAnalysis;
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    
    // Return a fallback analysis
    return {
      strengths: ["Analyse non disponible"],
      weaknesses: ["Analyse non disponible"],
      recommendations: ["Veuillez réessayer ultérieurement"],
      analysis: "Une erreur s'est produite lors de l'analyse de vos résultats.",
      confidenceScore: 0
    };
  }
}

// Helper function to save analysis to the database
async function saveAnalysisToDatabase(testType: string, results: any, analysis: AIEnhancedAnalysis) {
  try {
    // In a real implementation, you'd save this to your database
    console.log(`Saving ${testType} analysis to database...`);
    
    // Example of how you would save this with Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (sessionData?.session?.user?.id) {
      const { error } = await supabase.from('ai_analyses').insert({
        user_id: sessionData.session.user.id,
        test_type: testType,
        results: results,
        analysis: analysis,
        created_at: new Date().toISOString()
      });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error saving analysis to database:", error);
  }
}

// The following functions would normally be part of your AI service
// Here they just generate mock data based on the test type and results

function generateStrengths(testType: string, results: any): string[] {
  if (testType === 'riasec') {
    const strengths = [];
    if (results.realistic >= 70) strengths.push("Excellentes compétences pratiques et techniques");
    if (results.investigative >= 70) strengths.push("Forte capacité d'analyse et de résolution de problèmes");
    if (results.artistic >= 70) strengths.push("Grande créativité et imagination");
    if (results.social >= 70) strengths.push("Excellentes compétences en communication et collaboration");
    if (results.enterprising >= 70) strengths.push("Leadership et capacité à prendre des initiatives");
    if (results.conventional >= 70) strengths.push("Organisation et attention aux détails remarquables");
    
    return strengths.length > 0 ? strengths : ["Polyvalence et adaptabilité"];
  }
  
  return ["Analyse des forces non disponible pour ce type de test"];
}

function generateWeaknesses(testType: string, results: any): string[] {
  if (testType === 'riasec') {
    const weaknesses = [];
    if (results.realistic <= 30) weaknesses.push("Peut manquer de compétences pratiques dans certains contextes");
    if (results.investigative <= 30) weaknesses.push("Pourrait approfondir ses capacités d'analyse");
    if (results.artistic <= 30) weaknesses.push("Pourrait explorer davantage sa créativité");
    if (results.social <= 30) weaknesses.push("Pourrait développer ses compétences relationnelles");
    if (results.enterprising <= 30) weaknesses.push("Pourrait renforcer son leadership et sa prise d'initiative");
    if (results.conventional <= 30) weaknesses.push("Pourrait améliorer son organisation et sa méthodologie");
    
    return weaknesses.length > 0 ? weaknesses : ["Aucune faiblesse majeure identifiée"];
  }
  
  return ["Analyse des points à améliorer non disponible pour ce type de test"];
}

function generateRecommendations(testType: string, results: any): string[] {
  if (testType === 'riasec') {
    const recommendations = [
      "Explorez des formations alignées avec votre code RIASEC: " + results.personalityCode,
      "Recherchez des métiers qui correspondent à vos types dominants",
      "Développez vos compétences dans vos domaines de prédilection"
    ];
    
    return recommendations;
  }
  
  return ["Recommandations non disponibles pour ce type de test"];
}

function generateCareerSuggestions(testType: string, results: any): string[] {
  if (testType === 'riasec') {
    const careerMap: Record<string, string[]> = {
      'RIE': ['Ingénieur.e', 'Technicien.ne', 'Architecte'],
      'RIC': ['Analyste de données', 'Programmeur.euse', 'Technicien.ne de laboratoire'],
      'RIS': ['Médecin', 'Kinésithérapeute', 'Ergothérapeute'],
      'RIA': ['Designer industriel', 'Photographe technique', 'Artisan.e'],
      'REC': ['Chef.fe de chantier', 'Responsable logistique', 'Gestionnaire de production'],
      'RES': ['Instructeur.trice sportif.ve', 'Pompier.ère', 'Éducateur.trice spécialisé.e'],
      'REA': ['Entrepreneur.e', 'Chef.fe cuisinier.ère', 'Directeur.trice artistique'],
      'IRA': ['Chercheur.euse', 'Développeur.euse', 'Scientifique'],
      'IRC': ['Analyste de systèmes', 'Statisticien.ne', 'Économiste'],
      'IRS': ['Médecin chercheur.euse', 'Psychologue', 'Conseiller.ère d'orientation'],
      'SAE': ['Enseignant.e', 'Formateur.trice', 'Coach'],
      'SAC': ['Assistant.e social.e', 'Infirmier.ère', 'Thérapeute'],
      'SIA': ['Psychothérapeute', 'Conseiller.ère', 'Médiateur.trice culturel.le'],
      'ARS': ['Artiste', 'Musicien.ne', 'Acteur.trice'],
      'AIS': ['Écrivain.e', 'Journaliste', 'Traducteur.trice'],
      'AIR': ['Architecte', 'Designer', 'Créateur.trice de contenu'],
      'ESC': ['Directeur.trice commercial.e', 'Responsable marketing', 'Chef.fe de projet'],
      'ESA': ['Consultant.e', 'Directeur.trice de communication', 'Relations publiques'],
      'ERC': ['Entrepreneur.e', 'Chef.fe d'entreprise', 'Gestionnaire'],
      'CRS': ['Comptable', 'Assistant.e administratif.ve', 'Secrétaire médical.e'],
      'CRE': ['Contrôleur.euse de gestion', 'Auditeur.trice', 'Responsable administratif.ve'],
      'CIS': ['Gestionnaire de base de données', 'Bibliothécaire', 'Documentaliste']
    };
    
    // Get the first 3 letters of the personality code
    const code = results.personalityCode;
    
    // Try to match exactly, if not found try different combinations of the top 3
    let careers = careerMap[code] || [];
    
    if (careers.length === 0 && code.length >= 3) {
      // Try different combinations
      const combinations = [
        code.substring(0, 3),
        code.charAt(0) + code.charAt(2) + code.charAt(1),
        code.charAt(1) + code.charAt(0) + code.charAt(2),
        code.charAt(1) + code.charAt(2) + code.charAt(0),
        code.charAt(2) + code.charAt(0) + code.charAt(1),
        code.charAt(2) + code.charAt(1) + code.charAt(0)
      ];
      
      for (const combo of combinations) {
        if (careerMap[combo]) {
          careers = careerMap[combo];
          break;
        }
      }
    }
    
    // If still no match, return generic careers
    if (careers.length === 0) {
      careers = [
        'Consultant.e',
        'Chef.fe de projet',
        'Chargé.e de clientèle',
        'Formateur.trice',
        'Responsable de service'
      ];
    }
    
    return careers;
  }
  
  return ["Suggestions de carrière non disponibles pour ce type de test"];
}

function generateAnalysis(testType: string, results: any): string {
  if (testType === 'riasec') {
    return `Votre code RIASEC ${results.personalityCode} indique une préférence pour des environnements où vous pouvez utiliser vos compétences dominantes. Avec un score de confiance de ${results.confidenceScore}%, cette analyse suggère des orientations professionnelles alignées avec votre personnalité et vos intérêts.`;
  }
  
  return "Analyse détaillée non disponible pour ce type de test";
}
