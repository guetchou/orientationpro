
import { TestHistoryItem, AIEnhancedAnalysis } from '@/types/test';

// Mock AI analysis generator - in a real app this would use an actual AI model
export const generateAIEnhancedAnalysis = (
  testResults: TestHistoryItem
): AIEnhancedAnalysis => {
  try {
    // This is just a simple mock implementation
    const testType = testResults.testType;
    
    // Default analysis structure
    const analysis: AIEnhancedAnalysis = {
      dominantTraits: ["Analytique", "Adaptatif", "Résilient"],
      traitStrengths: {},
      traitCombinations: ["Analytique + Adaptatif", "Résilient + Analytique"],
      rawScores: testResults,
      analysisVersion: "1.0",
      testType: testType
    };
    
    // Customize based on test type
    switch(testType) {
      case 'riasec':
        analysis.dominantTraits = ["Investigateur", "Social", "Artistique"];
        analysis.traitCombinations = ["Investigateur + Social", "Artistique + Investigateur"];
        break;
      case 'emotional':
        analysis.dominantTraits = ["Empathie élevée", "Bonne régulation émotionnelle", "Conscience sociale"];
        analysis.traitCombinations = ["Empathie + Conscience sociale"];
        break;
      case 'learningStyle':
        analysis.dominantTraits = ["Apprentissage visuel", "Compréhension conceptuelle"];
        analysis.traitCombinations = ["Visuel + Kinesthésique"];
        break;
      case 'multipleIntelligence':
        analysis.dominantTraits = ["Intelligence logico-mathématique", "Intelligence interpersonnelle"];
        analysis.traitCombinations = ["Logico-mathématique + Interpersonnelle"];
        break;
      default:
        analysis.dominantTraits = ["Adaptabilité", "Résilience", "Auto-motivation"];
        analysis.traitCombinations = ["Adaptabilité + Résilience"];
    }
    
    return analysis;
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return {
      error: "Impossible de générer l'analyse IA pour ce test.",
      dominantTraits: [],
      traitStrengths: {},
      traitCombinations: [],
      analysisVersion: "1.0",
      testType: testResults.testType
    };
  }
};

// Additional utility function to explain trait combinations
export const explainTraitCombination = (combination: string): string => {
  const explanations: Record<string, string> = {
    "Investigateur + Social": "Cette combinaison indique une excellente capacité à résoudre des problèmes tout en maintenant des relations interpersonnelles fortes.",
    "Artistique + Investigateur": "Vous avez une approche créative de la résolution de problèmes et une forte curiosité intellectuelle.",
    "Empathie + Conscience sociale": "Vous êtes particulièrement doué pour comprendre les émotions des autres et naviguer dans des environnements sociaux complexes.",
    "Visuel + Kinesthésique": "Vous apprenez mieux en visualisant les concepts et en les mettant en pratique de manière concrète.",
    "Logico-mathématique + Interpersonnelle": "Vous combinez une pensée analytique rigoureuse avec de bonnes compétences sociales, ce qui est précieux en leadership.",
    "Adaptabilité + Résilience": "Vous vous adaptez facilement aux changements et rebondissez efficacement face aux défis."
  };
  
  return explanations[combination] || 
    "Cette combinaison de traits suggère un profil unique avec des forces complémentaires.";
};
