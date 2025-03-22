
import { questions } from "@/data/riasecQuestions";
import { 
  RiasecResults, 
  EmotionalTestResults, 
  MultipleIntelligenceResults,
  LearningStyleResults,
  AIEnhancedAnalysis
} from "@/types/test";

// Fonction pour normaliser les scores sur une échelle de 0 à 100
const normalizeScore = (score: number, maxPossible: number): number => {
  return Math.round((score / maxPossible) * 100);
};

// Calculer un score de confiance basé sur la cohérence des réponses
const calculateConfidence = (answers: number[]): number => {
  if (answers.length <= 1) return 100;
  
  // Calcul de l'écart-type pour évaluer la cohérence
  const average = answers.reduce((sum, val) => sum + val, 0) / answers.length;
  const squareDiffs = answers.map(value => Math.pow(value - average, 2));
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / answers.length;
  const stdDev = Math.sqrt(variance);
  
  // Plus l'écart-type est faible, plus les réponses sont cohérentes
  const normalizedStdDev = Math.min(stdDev / 2, 1); // Limiter à 1 pour le calcul
  const confidenceScore = 100 - (normalizedStdDev * 30); // Pénalité maximale de 30%
  
  return Math.round(Math.max(confidenceScore, 50)); // Minimum de 50% de confiance
};

// Analyser intelligemment les résultats du test RIASEC
export const analyzeRiasecSmartly = (answers: number[]): RiasecResults => {
  if (!answers || answers.length === 0) {
    throw new Error("Aucune réponse fournie pour l'analyse RIASEC");
  }
  
  // Catégoriser les questions par type RIASEC
  const categories = {
    R: [] as number[],
    I: [] as number[],
    A: [] as number[],
    S: [] as number[],
    E: [] as number[],
    C: [] as number[]
  };
  
  // Assigner les réponses aux catégories correspondantes
  answers.forEach((answer, index) => {
    if (index < questions.length) {
      const category = questions[index].category;
      if (category in categories) {
        categories[category as keyof typeof categories].push(answer);
      }
    }
  });
  
  // Calculer les scores moyens pour chaque catégorie
  const scores = {
    realistic: categories.R.length > 0 ? 
      categories.R.reduce((sum, val) => sum + val, 0) / categories.R.length : 0,
    investigative: categories.I.length > 0 ? 
      categories.I.reduce((sum, val) => sum + val, 0) / categories.I.length : 0,
    artistic: categories.A.length > 0 ? 
      categories.A.reduce((sum, val) => sum + val, 0) / categories.A.length : 0,
    social: categories.S.length > 0 ? 
      categories.S.reduce((sum, val) => sum + val, 0) / categories.S.length : 0,
    enterprising: categories.E.length > 0 ? 
      categories.E.reduce((sum, val) => sum + val, 0) / categories.E.length : 0,
    conventional: categories.C.length > 0 ? 
      categories.C.reduce((sum, val) => sum + val, 0) / categories.C.length : 0
  };
  
  // Normaliser les scores sur 100
  const normalizedScores = {
    realistic: normalizeScore(scores.realistic, 5),
    investigative: normalizeScore(scores.investigative, 5),
    artistic: normalizeScore(scores.artistic, 5),
    social: normalizeScore(scores.social, 5),
    enterprising: normalizeScore(scores.enterprising, 5),
    conventional: normalizeScore(scores.conventional, 5)
  };
  
  // Déterminer les types dominants (les 3 plus hauts scores)
  const sortedTypes = Object.entries(normalizedScores)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  const dominantTypes = sortedTypes.slice(0, 3);
  
  // Créer le code de personnalité Holland (premières lettres des 3 types dominants)
  const typeCodes = {
    realistic: "R",
    investigative: "I",
    artistic: "A",
    social: "S",
    enterprising: "E",
    conventional: "C"
  };
  
  const personalityCode = dominantTypes
    .map(type => typeCodes[type as keyof typeof typeCodes])
    .join("");
  
  // Calculer le score de confiance
  const confidenceScore = calculateConfidence(answers);
  
  return {
    ...normalizedScores,
    dominantTypes,
    personalityCode,
    confidenceScore
  };
};

// Analyser intelligemment les résultats du test d'intelligence émotionnelle
export const analyzeEmotionalSmartly = (answers: number[]): EmotionalTestResults => {
  if (!answers || answers.length === 0) {
    throw new Error("Aucune réponse fournie pour l'analyse d'intelligence émotionnelle");
  }
  
  // Simuler une analyse d'intelligence émotionnelle
  // Dans un cas réel, vous devriez avoir une logique spécifique basée sur vos questions
  const selfAwareness = Math.round((answers[0] + answers[1]) / 2 * 20); // Échelle 0-100
  const selfRegulation = Math.round(answers[1] * 20);
  const motivation = Math.round((answers[0] + answers[2]) / 2 * 20);
  const empathy = Math.round(answers[2] * 20);
  const socialSkills = Math.round((answers[1] + answers[2]) / 2 * 20);
  
  const overallScore = Math.round(
    (selfAwareness + selfRegulation + motivation + empathy + socialSkills) / 5
  );
  
  // Déterminer les forces et les domaines à améliorer
  const areas = [
    { name: "Conscience de soi", score: selfAwareness },
    { name: "Autorégulation", score: selfRegulation },
    { name: "Motivation", score: motivation },
    { name: "Empathie", score: empathy },
    { name: "Compétences sociales", score: socialSkills }
  ];
  
  const sortedAreas = [...areas].sort((a, b) => b.score - a.score);
  
  const strengths = sortedAreas
    .filter(area => area.score >= 70)
    .map(area => area.name);
  
  const areasToImprove = sortedAreas
    .filter(area => area.score < 60)
    .map(area => area.name);
  
  // Calculer le score de confiance
  const confidenceScore = calculateConfidence(answers);
  
  return {
    selfAwareness,
    selfRegulation,
    motivation,
    empathy,
    socialSkills,
    overallScore,
    strengths: strengths.length > 0 ? strengths : ["Aucune force significative identifiée"],
    areasToImprove: areasToImprove.length > 0 ? areasToImprove : ["Aucun domaine critique à améliorer"],
    confidenceScore
  };
};

// Analyser intelligemment les résultats du test d'intelligence multiple
export const analyzeMultipleIntelligenceSmartly = (answers: string[]): MultipleIntelligenceResults => {
  // Conversion des réponses textuelles en scores numériques pour simulation
  const numericAnswers = answers.map(answer => {
    if (answer.includes("mathématiques") || answer.includes("lisant")) return 5;
    if (answer.includes("musique") || answer.includes("sport")) return 4;
    if (answer.includes("schémas") || answer.includes("discutant")) return 3;
    return 2;
  });
  
  // Simulation de l'analyse des intelligences multiples
  const linguistic = Math.round(((numericAnswers[0] === 5 ? 5 : 3) + numericAnswers[2]) / 2 * 20);
  const logical = Math.round(numericAnswers[1] === 5 ? 90 : 60);
  const spatial = Math.round((numericAnswers[0] + numericAnswers[2]) / 2 * 20);
  const musical = Math.round(numericAnswers[1] === 4 ? 85 : 55);
  const bodily = Math.round(numericAnswers[1] === 4 ? 80 : 50);
  const interpersonal = Math.round(numericAnswers[2] === 3 ? 75 : 45);
  const intrapersonal = Math.round((numericAnswers[0] + numericAnswers[2]) / 2 * 15);
  const naturalist = Math.round((numericAnswers[0] + numericAnswers[1]) / 2 * 15);
  
  // Déterminer les intelligences dominantes
  const intelligences = [
    { name: "linguistic", score: linguistic },
    { name: "logical", score: logical },
    { name: "spatial", score: spatial },
    { name: "musical", score: musical },
    { name: "bodily", score: bodily },
    { name: "interpersonal", score: interpersonal },
    { name: "intrapersonal", score: intrapersonal },
    { name: "naturalist", score: naturalist }
  ];
  
  const sortedIntelligences = [...intelligences].sort((a, b) => b.score - a.score);
  const dominantIntelligences = sortedIntelligences
    .slice(0, 3)
    .map(item => item.name);
  
  // Calculer le score de confiance
  const confidenceScore = calculateConfidence(numericAnswers);
  
  return {
    linguistic,
    logical,
    spatial,
    musical,
    bodily,
    interpersonal,
    intrapersonal,
    naturalist,
    dominantIntelligences,
    confidenceScore
  };
};

// Analyser intelligemment les résultats du test de style d'apprentissage
export const analyzeLearningStyleSmartly = (answers: string[]): LearningStyleResults => {
  const styleScores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    reading: 0
  };
  
  // Évaluer les réponses et attribuer des scores
  answers.forEach(answer => {
    if (answer.includes("visuelle") || answer.includes("schémas") || answer.includes("vidéo")) {
      styleScores.visual += 25;
    }
    if (answer.includes("écoutant") || answer.includes("écouter") || answer.includes("voix")) {
      styleScores.auditory += 25;
    }
    if (answer.includes("essayant") || answer.includes("expérimenter") || answer.includes("pratique")) {
      styleScores.kinesthetic += 25;
    }
    if (answer.includes("écrit") || answer.includes("manuel") || answer.includes("notes")) {
      styleScores.reading += 25;
    }
  });
  
  // Limiter les scores à 100
  for (const style in styleScores) {
    styleScores[style as keyof typeof styleScores] = Math.min(
      styleScores[style as keyof typeof styleScores], 
      100
    );
  }
  
  // Déterminer les styles primaire et secondaire
  const styles = Object.entries(styleScores)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  const primary = styles[0];
  const secondary = styles[1];
  
  // Générer des recommandations de stratégies d'apprentissage
  const recommendedStrategies = generateLearningStrategies(primary, secondary);
  
  // Calculer le score de confiance
  const confidenceScore = 85; // Valeur fixe pour cette démo
  
  return {
    ...styleScores,
    primary,
    secondary,
    recommendedStrategies,
    confidenceScore
  };
};

// Fonction d'aide pour générer des stratégies d'apprentissage basées sur les styles
function generateLearningStrategies(primary: string, secondary: string): string[] {
  const strategies: Record<string, string[]> = {
    visual: [
      "Utiliser des cartes mentales pour organiser l'information",
      "Préférer les supports visuels (graphiques, schémas, vidéos)",
      "Coder l'information avec des couleurs différentes",
      "Visualiser mentalement les concepts"
    ],
    auditory: [
      "Enregistrer et réécouter les cours",
      "Participer à des discussions de groupe",
      "Répéter à voix haute les informations importantes",
      "Transformer les notes en histoires ou chansons"
    ],
    kinesthetic: [
      "Apprendre en manipulant des objets",
      "Faire des pauses fréquentes lors de l'étude",
      "Associer des mouvements aux concepts à mémoriser",
      "Privilégier les activités pratiques et expérimentales"
    ],
    reading: [
      "Prendre des notes détaillées",
      "Créer des résumés écrits",
      "Réécrire les points clés avec ses propres mots",
      "Organiser l'information sous forme de listes"
    ]
  };
  
  // Combiner des stratégies des styles primaire et secondaire
  const primaryStrategies = strategies[primary] || [];
  const secondaryStrategies = strategies[secondary] || [];
  
  return [
    ...primaryStrategies.slice(0, 3),
    ...secondaryStrategies.slice(0, 1)
  ];
}

// Nouvelle fonction: Analyse augmentée par l'IA (simule une analyse IA avancée)
export const enhanceResultsWithAI = (testType: string, results: any): AIEnhancedAnalysis => {
  // Simule une analyse IA avancée basée sur le type de test
  const aiResults: AIEnhancedAnalysis = {
    personalityInsights: [],
    careerRecommendations: [],
    learningPathways: [],
    strengthWeaknessAnalysis: [],
    compatibilityMatrix: {},
    developmentSuggestions: [],
    confidenceScore: results.confidenceScore || 85
  };
  
  switch(testType) {
    case 'RIASEC':
    case 'riasec':
      aiResults.personalityInsights = generateRiasecInsights(results);
      aiResults.careerRecommendations = generateRiasecCareers(results);
      break;
    case 'emotional':
      aiResults.personalityInsights = generateEmotionalInsights(results);
      aiResults.developmentSuggestions = generateEmotionalDevelopment(results);
      break;
    case 'multiple_intelligence':
      aiResults.learningPathways = generateIntelligencePathways(results);
      aiResults.strengthWeaknessAnalysis = generateIntelligenceStrengths(results);
      break;
    case 'learning_style':
      aiResults.learningPathways = generateLearningPathways(results);
      aiResults.developmentSuggestions = generateLearningDevelopment(results);
      break;
  }
  
  return aiResults;
};

// Fonctions d'aide pour générer des insights basés sur l'IA
function generateRiasecInsights(results: RiasecResults): string[] {
  const insights = [];
  const { dominantTypes } = results;
  
  if (dominantTypes?.includes("realistic")) {
    insights.push("Vous êtes une personne pratique qui préfère travailler avec des objets concrets plutôt que des idées abstraites.");
  }
  
  if (dominantTypes?.includes("investigative")) {
    insights.push("Votre esprit analytique vous permet d'explorer des problèmes complexes avec patience et précision.");
  }
  
  if (dominantTypes?.includes("artistic")) {
    insights.push("Votre créativité est une force majeure qui vous permet d'apporter des solutions originales à divers problèmes.");
  }
  
  if (dominantTypes?.includes("social")) {
    insights.push("Votre capacité à comprendre et aider les autres est remarquable et constitue un atout majeur dans votre vie professionnelle.");
  }
  
  if (dominantTypes?.includes("enterprising")) {
    insights.push("Vous avez un talent naturel pour influencer et diriger les autres, préférant les rôles de leadership.");
  }
  
  if (dominantTypes?.includes("conventional")) {
    insights.push("Votre approche organisée et méthodique vous permet d'exceller dans des environnements structurés.");
  }
  
  return insights;
}

function generateRiasecCareers(results: RiasecResults): string[] {
  const careers = [];
  const { personalityCode } = results;
  
  // Recommandations basées sur les codes les plus courants
  const careerMap: Record<string, string[]> = {
    "RIA": ["Ingénieur(e) en mécanique", "Architecte", "Chercheur(se) technique"],
    "RIE": ["Entrepreneur(e) technique", "Responsable R&D", "Consultant(e) en ingénierie"],
    "RAI": ["Designer industriel", "Technicien(ne) en audiovisuel", "Artisan(e) spécialisé(e)"],
    "RSE": ["Coach sportif", "Responsable logistique", "Formateur(trice) technique"],
    "IRA": ["Chercheur(se) scientifique", "Développeur(se) de logiciels", "Ingénieur(e) en biotechnologie"],
    "ISA": ["Psychologue de recherche", "Biologiste", "Professeur(e) de sciences"],
    "AIR": ["Designer", "Architecte d'intérieur", "Réalisateur(trice)"],
    "AIS": ["Thérapeute par l'art", "Enseignant(e) d'art", "Musicothérapeute"],
    "SAI": ["Conseiller(ère) d'orientation", "Ergothérapeute", "Travailleur(se) social(e)"],
    "SIA": ["Conseiller(ère) pédagogique", "Psychologue clinicien(ne)", "Formateur(trice)"],
    "EIC": ["Directeur(trice) financier(ère)", "Entrepreneur(e)", "Consultant(e) en management"],
    "ESC": ["Chef d'équipe", "Responsable des ventes", "Directeur(trice) marketing"],
    "CES": ["Comptable", "Analyste financier(ère)", "Gestionnaire administratif(ve)"],
    "CSE": ["Auditeur(trice)", "Expert(e)-comptable", "Responsable conformité"]
  };
  
  // Trouver le code exact ou un code proche
  if (personalityCode && personalityCode.length >= 3) {
    const code = personalityCode.substring(0, 3);
    if (careerMap[code]) {
      return careerMap[code];
    }
    
    // Si le code exact n'existe pas, chercher des codes similaires
    const similarCodes = Object.keys(careerMap).filter(c => 
      c.includes(code.charAt(0)) && c.includes(code.charAt(1))
    );
    
    if (similarCodes.length > 0) {
      const randomIndex = Math.floor(Math.random() * similarCodes.length);
      return careerMap[similarCodes[randomIndex]];
    }
  }
  
  // Valeurs par défaut si aucune correspondance
  return [
    "Analyste de données",
    "Chef de projet",
    "Consultant(e) en ressources humaines",
    "Responsable de communication"
  ];
}

function generateEmotionalInsights(results: EmotionalTestResults): string[] {
  const insights = [];
  
  if (results.selfAwareness > 75) {
    insights.push("Vous possédez une excellente conscience de vos émotions, ce qui constitue une base solide pour votre intelligence émotionnelle.");
  } else if (results.selfAwareness < 50) {
    insights.push("Développer votre conscience émotionnelle vous permettrait de mieux comprendre vos réactions et motivations.");
  }
  
  if (results.empathy > 75) {
    insights.push("Votre grande capacité d'empathie vous permet de créer des connexions profondes avec les autres.");
  }
  
  if (results.selfRegulation < 60 && results.socialSkills > 70) {
    insights.push("Vos compétences sociales sont bonnes, mais vous pourriez bénéficier d'un meilleur contrôle de vos réactions émotionnelles.");
  }
  
  if (results.motivation > 80) {
    insights.push("Votre niveau élevé de motivation intrinsèque est un moteur puissant pour atteindre vos objectifs.");
  }
  
  return insights.length > 0 ? insights : ["Votre profil émotionnel est équilibré avec des opportunités d'amélioration dans plusieurs domaines."];
}

function generateEmotionalDevelopment(results: EmotionalTestResults): string[] {
  const suggestions = [];
  
  if (results.selfAwareness < 70) {
    suggestions.push("Pratiquer la méditation pleine conscience pendant 10 minutes par jour pour améliorer votre conscience émotionnelle.");
  }
  
  if (results.selfRegulation < 70) {
    suggestions.push("Tenir un journal émotionnel pour identifier les déclencheurs et développer des stratégies de régulation.");
  }
  
  if (results.empathy < 70) {
    suggestions.push("Exercer l'écoute active lors de vos conversations pour développer votre empathie.");
  }
  
  if (results.socialSkills < 70) {
    suggestions.push("Rejoindre un groupe ou un club pour pratiquer vos compétences sociales dans un cadre bienveillant.");
  }
  
  return suggestions.length > 0 ? suggestions : ["Continuer à pratiquer régulièrement la réflexion sur vos émotions et leurs impacts sur vos décisions."];
}

function generateIntelligencePathways(results: MultipleIntelligenceResults): string[] {
  const pathways = [];
  const { dominantIntelligences } = results;
  
  if (dominantIntelligences?.includes("linguistic")) {
    pathways.push("Programmes d'études en communication, journalisme, littérature ou langues étrangères.");
  }
  
  if (dominantIntelligences?.includes("logical")) {
    pathways.push("Cursus en mathématiques, informatique, ingénierie ou sciences.");
  }
  
  if (dominantIntelligences?.includes("spatial")) {
    pathways.push("Formations en architecture, design, arts visuels ou navigation.");
  }
  
  if (dominantIntelligences?.includes("musical")) {
    pathways.push("Études en musique, composition, production audio ou technologies du son.");
  }
  
  if (dominantIntelligences?.includes("bodily")) {
    pathways.push("Parcours en éducation physique, danse, théâtre ou kinésithérapie.");
  }
  
  if (dominantIntelligences?.includes("interpersonal")) {
    pathways.push("Formations en psychologie, enseignement, management ou travail social.");
  }
  
  if (dominantIntelligences?.includes("intrapersonal")) {
    pathways.push("Études en philosophie, psychologie, coaching ou développement personnel.");
  }
  
  if (dominantIntelligences?.includes("naturalist")) {
    pathways.push("Parcours en biologie, écologie, agriculture ou sciences environnementales.");
  }
  
  return pathways;
}

function generateIntelligenceStrengths(results: MultipleIntelligenceResults): string[] {
  const strengths = [];
  
  const highScores = Object.entries(results)
    .filter(([key, value]) => typeof value === 'number' && value > 70 && !['confidenceScore'].includes(key))
    .sort((a, b) => b[1] as number - (a[1] as number));
  
  const lowScores = Object.entries(results)
    .filter(([key, value]) => typeof value === 'number' && value < 50 && !['confidenceScore'].includes(key))
    .sort((a, b) => (a[1] as number) - (b[1] as number));
  
  if (highScores.length > 0) {
    const [topKey, topValue] = highScores[0];
    switch (topKey) {
      case 'linguistic':
        strengths.push(`Force majeure: Intelligence linguistique (${topValue}/100) - Excellente capacité à manier les mots et les concepts.");`);
        break;
      case 'logical':
        strengths.push(`Force majeure: Intelligence logico-mathématique (${topValue}/100) - Forte aptitude à raisonner, analyser et résoudre des problèmes.`);
        break;
      case 'spatial':
        strengths.push(`Force majeure: Intelligence spatiale (${topValue}/100) - Grande capacité à visualiser et manipuler des objets dans l'espace.`);
        break;
      case 'musical':
        strengths.push(`Force majeure: Intelligence musicale (${topValue}/100) - Sensibilité particulière aux sons, rythmes et structures musicales.`);
        break;
      case 'bodily':
        strengths.push(`Force majeure: Intelligence kinesthésique (${topValue}/100) - Excellente coordination physique et conscience corporelle.`);
        break;
      case 'interpersonal':
        strengths.push(`Force majeure: Intelligence interpersonnelle (${topValue}/100) - Grande capacité à comprendre et interagir avec les autres.`);
        break;
      case 'intrapersonal':
        strengths.push(`Force majeure: Intelligence intrapersonnelle (${topValue}/100) - Profonde compréhension de soi-même et de ses émotions.`);
        break;
      case 'naturalist':
        strengths.push(`Force majeure: Intelligence naturaliste (${topValue}/100) - Forte aptitude à observer et classifier les éléments naturels.`);
        break;
    }
  }
  
  if (lowScores.length > 0) {
    const [lowestKey, lowestValue] = lowScores[0];
    switch (lowestKey) {
      case 'linguistic':
        strengths.push(`Zone de développement: Intelligence linguistique (${lowestValue}/100) - Privilégiez la lecture et l'écriture régulière.`);
        break;
      case 'logical':
        strengths.push(`Zone de développement: Intelligence logico-mathématique (${lowestValue}/100) - Exercez-vous aux jeux de logique et aux mathématiques.`);
        break;
      case 'spatial':
        strengths.push(`Zone de développement: Intelligence spatiale (${lowestValue}/100) - Pratiquez le dessin et les jeux de construction.`);
        break;
      case 'musical':
        strengths.push(`Zone de développement: Intelligence musicale (${lowestValue}/100) - Exposez-vous à différents types de musique et instruments.`);
        break;
      case 'bodily':
        strengths.push(`Zone de développement: Intelligence kinesthésique (${lowestValue}/100) - Engagez-vous dans des activités physiques variées.`);
        break;
      case 'interpersonal':
        strengths.push(`Zone de développement: Intelligence interpersonnelle (${lowestValue}/100) - Participez à des activités de groupe et pratiquez l'écoute active.`);
        break;
      case 'intrapersonal':
        strengths.push(`Zone de développement: Intelligence intrapersonnelle (${lowestValue}/100) - Tenez un journal personnel et pratiquez la méditation.`);
        break;
      case 'naturalist':
        strengths.push(`Zone de développement: Intelligence naturaliste (${lowestValue}/100) - Passez du temps dans la nature et observez l'environnement.`);
        break;
    }
  }
  
  return strengths;
}

function generateLearningPathways(results: LearningStyleResults): string[] {
  const { primary, secondary } = results;
  const pathways = [];
  
  if (primary === 'visual') {
    pathways.push("Formations enrichies en supports visuels, graphiques et vidéos.");
    pathways.push("Apprentissage en ligne avec forte composante visuelle.");
  } else if (primary === 'auditory') {
    pathways.push("Cours magistraux, podcasts et apprentissage par discussion.");
    pathways.push("Formations avec composantes audio importantes.");
  } else if (primary === 'kinesthetic') {
    pathways.push("Formations pratiques et expérientielles.");
    pathways.push("Apprentissage par projets et activités manuelles.");
  } else if (primary === 'reading') {
    pathways.push("Programmes basés sur la lecture et l'écriture.");
    pathways.push("Apprentissage autodidacte avec ressources écrites.");
  }
  
  return pathways;
}

function generateLearningDevelopment(results: LearningStyleResults): string[] {
  const { primary, secondary } = results;
  const suggestions = [];
  
  // Suggestions communes
  suggestions.push("Diversifiez vos méthodes d'apprentissage pour développer tous les styles.");
  
  // Suggestions spécifiques basées sur le style primaire
  if (primary === 'visual') {
    suggestions.push("Créez des cartes mentales et des schémas pour organiser vos idées.");
    suggestions.push("Utilisez des codes couleurs pour classer l'information.");
  } else if (primary === 'auditory') {
    suggestions.push("Enregistrez et réécoutez les informations importantes.");
    suggestions.push("Participez à des groupes de discussion pour renforcer votre apprentissage.");
  } else if (primary === 'kinesthetic') {
    suggestions.push("Intégrez du mouvement dans votre apprentissage, comme marcher en révisant.");
    suggestions.push("Utilisez des objets physiques pour représenter des concepts.");
  } else if (primary === 'reading') {
    suggestions.push("Prenez des notes détaillées et réécrivez les informations importantes.");
    suggestions.push("Créez des résumés structurés pour consolider votre compréhension.");
  }
  
  return suggestions;
}
