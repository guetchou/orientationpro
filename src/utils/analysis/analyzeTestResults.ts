
import { TestResults, AIEnhancedAnalysis } from "@/types/test";

export const analyzeTestResults = (testType: string, results: TestResults): AIEnhancedAnalysis => {
  // Logique d'analyse basique pour les résultats de test
  let insights: string[] = [];
  let recommendations: string[] = [];
  let pathways: string[] = [];
  let analysis: string[] = [];
  let suggestions: string[] = [];
  
  // Analyse par type de test
  switch (testType) {
    case 'RIASEC':
      insights = [
        "Vos intérêts professionnels sont fortement orientés vers les domaines créatifs et sociaux.",
        "Vous semblez privilégier les environnements de travail collaboratifs et peu conventionnels."
      ];
      recommendations = [
        "Métiers de la communication",
        "Éducation et formation",
        "Design et arts visuels"
      ];
      break;
      
    case 'emotional':
      insights = [
        "Vous faites preuve d'une grande capacité à percevoir et comprendre les émotions d'autrui.",
        "La gestion de vos propres émotions est un domaine où vous pourriez développer davantage de stratégies."
      ];
      recommendations = [
        "Conseil et accompagnement",
        "Ressources humaines",
        "Médiation et résolution de conflits"
      ];
      break;
      
    case 'multiple_intelligence':
      insights = [
        "Vos intelligences linguistique et interpersonnelle sont particulièrement développées.",
        "Vous pourriez bénéficier de stimuler davantage votre intelligence logico-mathématique."
      ];
      recommendations = [
        "Journalisme et médias",
        "Enseignement",
        "Relations publiques"
      ];
      break;
      
    case 'learning_style':
      insights = [
        "Votre style d'apprentissage dominant est visuel, suivi de près par le style kinesthésique.",
        "Vous assimilez mieux les informations présentées sous forme de schémas et d'illustrations."
      ];
      pathways = [
        "Privilégiez les cours avec supports visuels",
        "Utilisez des cartes mentales pour réviser",
        "Complétez votre apprentissage par des activités pratiques"
      ];
      break;
      
    default:
      insights = [
        "Vos résultats montrent un profil équilibré avec des points forts diversifiés.",
        "Vous semblez avoir une bonne connaissance de vos préférences professionnelles."
      ];
  }
  
  // Analyse des forces et faiblesses (générique)
  analysis = [
    "Forces: adaptabilité, créativité, ouverture d'esprit",
    "Points à développer: organisation, prise de décision, patience"
  ];
  
  // Suggestions de développement (génériques)
  suggestions = [
    "Suivre une formation complémentaire dans un domaine technique",
    "Développer vos compétences en gestion de projet",
    "Explorer des domaines professionnels émergents"
  ];
  
  return {
    personalityInsights: insights,
    careerRecommendations: recommendations,
    learningPathways: pathways,
    strengthWeaknessAnalysis: analysis,
    developmentSuggestions: suggestions,
    confidenceScore: 80
  };
};
