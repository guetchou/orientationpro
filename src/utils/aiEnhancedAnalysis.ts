
import { supabase } from '@/lib/supabaseClient';
import { AIEnhancedAnalysis } from '@/types/test';
import { toast } from 'sonner';

export async function getAIEnhancedAnalysis(testType: string, testResults: any): Promise<AIEnhancedAnalysis> {
  try {
    // En production, nous utiliserions l'API pour l'analyse IA
    // Ici, nous générons une analyse simulée
    
    // Simule une requête à l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Récupère les résultats du test précédent si disponible
    const { data: previousTests } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_type', testType)
      .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.id))
      .order('created_at', { ascending: false })
      .limit(1);
    
    // Comparaison avec le test précédent pour enrichir l'analyse
    const previousTest = previousTests?.[0];
    let progressInsight = '';
    
    if (previousTest) {
      const previousResults = previousTest.results;
      progressInsight = `Par rapport à votre dernier test, vous avez fait des progrès significatifs.`;
    }
    
    // Analyse IA générique basée sur le type de test
    let analysis: AIEnhancedAnalysis = {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      analysis: '',
      confidenceScore: 85
    };
    
    // Génère une analyse spécifique en fonction du type de test
    switch (testType) {
      case 'riasec':
        analysis = generateRiasecAnalysis(testResults);
        break;
      case 'emotional':
        analysis = generateEmotionalAnalysis(testResults);
        break;
      case 'learning':
        analysis = generateLearningStyleAnalysis(testResults);
        break;
      case 'intelligence':
        analysis = generateMultipleIntelligenceAnalysis(testResults);
        break;
      default:
        // Analyse générique si le type de test n'est pas reconnu
        analysis = {
          strengths: ["Adaptabilité", "Conscience de soi"],
          weaknesses: ["Gestion du stress", "Organisation"],
          recommendations: ["Pratiquer la pleine conscience", "Établir des routines quotidiennes"],
          careerSuggestions: ["Consultance", "Éducation", "Entrepreneuriat"],
          analysis: `Basé sur vos résultats, vous montrez une bonne adaptabilité et conscience de soi. ${progressInsight} Vous pourriez améliorer votre gestion du stress et vos compétences organisationnelles.`,
          confidenceScore: 80
        };
    }
    
    return analysis;
    
  } catch (error) {
    console.error("Erreur lors de l'analyse IA:", error);
    toast.error("Une erreur s'est produite lors de l'analyse IA");
    
    // Renvoie une analyse par défaut en cas d'erreur
    return {
      strengths: ["Adaptabilité"],
      weaknesses: ["Gestion du stress"],
      recommendations: ["Pratiquer la pleine conscience"],
      analysis: "Nous n'avons pas pu générer une analyse complète. Veuillez réessayer ultérieurement.",
      confidenceScore: 60
    };
  }
}

// Fonctions pour générer des analyses spécifiques
function generateRiasecAnalysis(results: any): AIEnhancedAnalysis {
  const dominantTypes = results.dominantTypes || [];
  
  return {
    strengths: [
      "Vous avez une forte affinité pour les activités " + (dominantTypes[0] || "diverses"),
      "Vous pouvez exceller dans des environnements qui valorisent " + (dominantTypes[1] || "vos compétences")
    ],
    weaknesses: [
      "Vous pourriez éviter les tâches associées aux types opposés à votre profil",
      "Tendance à vous concentrer trop sur vos domaines de prédilection"
    ],
    recommendations: [
      "Explorez des carrières qui combinent vos deux types dominants",
      "Développez des compétences dans vos domaines moins forts pour être plus polyvalent"
    ],
    careerSuggestions: generateCareerSuggestions(dominantTypes),
    analysis: `Votre profil RIASEC montre une forte dominance des types ${dominantTypes.join(' et ')}. Cela indique que vous êtes naturellement attiré par des activités qui impliquent ${getTypeDescription(dominantTypes[0])}. Vous pourriez vous épanouir dans des environnements professionnels qui valorisent ces caractéristiques.`,
    confidenceScore: 90
  };
}

function generateEmotionalAnalysis(results: any): AIEnhancedAnalysis {
  return {
    strengths: [
      "Bonne conscience de soi",
      "Capacité à établir des relations"
    ],
    weaknesses: [
      "Gestion du stress dans des situations difficiles",
      "Autorégulation émotionnelle"
    ],
    recommendations: [
      "Pratiquer des techniques de pleine conscience",
      "Développer des stratégies de communication assertive"
    ],
    analysis: `Votre intelligence émotionnelle est bien développée, avec un score global de ${results.overallScore}%. Vous montrez une force particulière dans la conscience de soi, ce qui vous permet de comprendre vos propres émotions. Continuez à travailler sur votre autorégulation pour maximiser votre potentiel.`,
    confidenceScore: 85
  };
}

function generateLearningStyleAnalysis(results: any): AIEnhancedAnalysis {
  return {
    strengths: [
      `Apprentissage efficace via des méthodes ${results.primary}`,
      `Bonne capacité d'adaptation à différents styles d'apprentissage`
    ],
    weaknesses: [
      `Difficulté potentielle avec les méthodes d'apprentissage moins compatibles`,
      `Tendance à éviter certains types de matériel éducatif`
    ],
    recommendations: [
      `Utilisez des supports ${results.primary} pour maximiser votre apprentissage`,
      `Expérimentez avec des méthodes ${results.secondary} comme complément`,
      `Variez vos techniques d'étude pour développer une approche équilibrée`
    ],
    analysis: `Votre style d'apprentissage dominant est ${results.primary}, avec ${results.secondary} comme style secondaire. Cela signifie que vous apprenez mieux lorsque l'information est présentée sous forme ${getLearningStyleDescription(results.primary)}. Pour optimiser votre apprentissage, cherchez des ressources qui correspondent à ces préférences.`,
    confidenceScore: 88
  };
}

function generateMultipleIntelligenceAnalysis(results: any): AIEnhancedAnalysis {
  return {
    strengths: [
      `Intelligence ${results.dominantIntelligence} développée`,
      `Bonne capacité dans le domaine ${results.secondaryIntelligence}`
    ],
    weaknesses: [
      "Potentiellement moins à l'aise avec certains types de tâches",
      "Tendance à privilégier certaines approches de résolution de problèmes"
    ],
    recommendations: [
      `Explorez des carrières qui valorisent l'intelligence ${results.dominantIntelligence}`,
      "Développez des activités qui stimulent vos intelligences moins dominantes",
      "Combinez vos forces pour une approche unique des défis"
    ],
    careerSuggestions: generateIntelligenceCareerSuggestions(results.dominantIntelligence),
    analysis: `Votre profil d'intelligences multiples révèle une dominance dans le domaine ${results.dominantIntelligence}, suivi par ${results.secondaryIntelligence}. Cela signifie que vous avez une affinité naturelle pour ${getIntelligenceDescription(results.dominantIntelligence)}. Cette combinaison unique vous donne des atouts particuliers pour certains domaines professionnels.`,
    confidenceScore: 87
  };
}

// Fonctions utilitaires pour générer du contenu spécifique
function getTypeDescription(type: string): string {
  const descriptions: {[key: string]: string} = {
    'R': 'le travail manuel, technique et pratique',
    'I': 'l\'analyse, la recherche et la résolution de problèmes complexes',
    'A': 'l\'expression créative et artistique',
    'S': 'l\'aide aux autres, l\'enseignement et le travail en équipe',
    'E': 'la prise de décision, la direction et l\'entrepreneuriat',
    'C': 'l\'organisation, la précision et le respect des procédures'
  };
  return descriptions[type] || 'diverses activités professionnelles';
}

function getLearningStyleDescription(style: string): string {
  const descriptions: {[key: string]: string} = {
    'visuel': 'visuelle, comme des diagrammes, des images et des vidéos',
    'auditif': 'auditive, comme des présentations orales et des discussions',
    'kinesthésique': 'pratique, impliquant le mouvement et l\'expérimentation',
    'lecture/écriture': 'textuelle, à travers la lecture et l\'écriture'
  };
  return descriptions[style.toLowerCase()] || 'variée';
}

function getIntelligenceDescription(intelligence: string): string {
  const descriptions: {[key: string]: string} = {
    'logique': 'le raisonnement abstrait et la résolution de problèmes complexes',
    'linguistique': 'la manipulation du langage et l\'expression verbale',
    'spatiale': 'la visualisation et la manipulation d\'objets dans l\'espace',
    'musicale': 'la perception et la création de motifs sonores',
    'kinesthésique': 'le contrôle corporel et la coordination physique',
    'interpersonnelle': 'la compréhension et l\'interaction avec les autres',
    'intrapersonnelle': 'l\'introspection et la connaissance de soi',
    'naturaliste': 'l\'observation et la classification des éléments naturels'
  };
  return descriptions[intelligence.toLowerCase()] || 'différents types d\'apprentissage et de résolution de problèmes';
}

function generateCareerSuggestions(dominantTypes: string[]): string[] {
  const careersByType: {[key: string]: string[]} = {
    'R': ['Ingénieur', 'Technicien', 'Mécanicien', 'Agriculteur', 'Électricien'],
    'I': ['Chercheur', 'Scientifique', 'Analyste de données', 'Médecin', 'Programmeur'],
    'A': ['Artiste', 'Designer', 'Architecte', 'Musicien', 'Rédacteur créatif'],
    'S': ['Enseignant', 'Travailleur social', 'Conseiller', 'Infirmier', 'Psychologue'],
    'E': ['Entrepreneur', 'Directeur commercial', 'Avocat', 'Gestionnaire de projet', 'Agent immobilier'],
    'C': ['Comptable', 'Analyste financier', 'Assistant administratif', 'Auditeur', 'Bibliothécaire']
  };
  
  const suggestions: string[] = [];
  
  // Ajouter des suggestions basées sur le premier type dominant
  if (dominantTypes[0] && careersByType[dominantTypes[0]]) {
    suggestions.push(...careersByType[dominantTypes[0]].slice(0, 2));
  }
  
  // Ajouter des suggestions basées sur le deuxième type dominant
  if (dominantTypes[1] && careersByType[dominantTypes[1]]) {
    suggestions.push(...careersByType[dominantTypes[1]].slice(0, 2));
  }
  
  // Ajouter des combinaisons uniques si plusieurs types sont disponibles
  if (dominantTypes[0] && dominantTypes[1]) {
    const combos: {[key: string]: string[]} = {
      'RI': ['Ingénieur de recherche', 'Technicien de laboratoire'],
      'RA': ['Dessinateur technique', 'Artisan'],
      'RS': ['Formateur technique', 'Ergothérapeute'],
      'RE': ['Chef de chantier', 'Entrepreneur en construction'],
      'RC': ['Inspecteur en bâtiment', 'Technicien qualité'],
      'IA': ['Architecte logiciel', 'Designer UX/UI'],
      'IS': ['Professeur de sciences', 'Chercheur en sciences sociales'],
      'IE': ['Consultant en technologie', 'Analyste d\'affaires'],
      'IC': ['Analyste de systèmes', 'Statisticien'],
      'AS': ['Art-thérapeute', 'Professeur d\'art'],
      'AE': ['Directeur créatif', 'Producteur de médias'],
      'AC': ['Designer d\'intérieur', 'Éditeur'],
      'SE': ['Responsable des ressources humaines', 'Coordinateur d\'événements'],
      'SC': ['Conseiller d\'orientation', 'Administrateur hospitalier'],
      'EC': ['Gestionnaire financier', 'Directeur administratif']
    };
    
    const key = `${dominantTypes[0]}${dominantTypes[1]}`;
    const reverseKey = `${dominantTypes[1]}${dominantTypes[0]}`;
    
    if (combos[key]) {
      suggestions.push(...combos[key]);
    } else if (combos[reverseKey]) {
      suggestions.push(...combos[reverseKey]);
    }
  }
  
  return suggestions.length > 0 ? suggestions : ['Consultant', 'Entrepreneur', 'Éducateur'];
}

function generateIntelligenceCareerSuggestions(intelligence: string): string[] {
  const suggestions: {[key: string]: string[]} = {
    'logique': ['Mathématicien', 'Programmeur', 'Scientifique', 'Ingénieur', 'Analyste financier'],
    'linguistique': ['Écrivain', 'Journaliste', 'Enseignant', 'Avocat', 'Traducteur'],
    'spatiale': ['Architecte', 'Artiste visuel', 'Designer', 'Pilote', 'Chirurgien'],
    'musicale': ['Musicien', 'Compositeur', 'Ingénieur du son', 'Professeur de musique', 'Thérapeute musical'],
    'kinesthésique': ['Athlète', 'Danseur', 'Chirurgien', 'Physiothérapeute', 'Instructeur de fitness'],
    'interpersonnelle': ['Thérapeute', 'Vendeur', 'Négociateur', 'Manager', 'Consultant en relations publiques'],
    'intrapersonnelle': ['Psychologue', 'Écrivain', 'Entrepreneur', 'Chercheur', 'Artiste'],
    'naturaliste': ['Biologiste', 'Vétérinaire', 'Botaniste', 'Jardinier paysagiste', 'Guide environnemental']
  };
  
  return suggestions[intelligence.toLowerCase()] || ['Consultant', 'Entrepreneur', 'Éducateur'];
}
