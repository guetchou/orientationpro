
import { questions } from "@/data/riasecQuestions";

// Type pour les résultats des tests RIASEC
export interface SmartRiasecResults {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  dominantTypes: string[];
  personalityCode: string;
  confidenceScore: number;
}

// Type pour les résultats des tests d'intelligence émotionnelle
export interface SmartEmotionalResults {
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  overallScore: number;
  strengths: string[];
  areasToImprove: string[];
  confidenceScore: number;
}

// Type pour les résultats des tests d'intelligence multiple
export interface SmartMultipleIntelligenceResults {
  linguistic: number;
  logical: number;
  spatial: number;
  musical: number;
  bodily: number;
  interpersonal: number;
  intrapersonal: number;
  naturalist: number;
  dominantIntelligences: string[];
  confidenceScore: number;
}

// Type pour les résultats des tests de style d'apprentissage
export interface SmartLearningStyleResults {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  primary: string;
  secondary: string;
  recommendedStrategies: string[];
  confidenceScore: number;
}

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
export const analyzeRiasecSmartly = (answers: number[]): SmartRiasecResults => {
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
export const analyzeEmotionalSmartly = (answers: number[]): SmartEmotionalResults => {
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
export const analyzeMultipleIntelligenceSmartly = (answers: string[]): SmartMultipleIntelligenceResults => {
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
export const analyzeLearningStyleSmartly = (answers: string[]): SmartLearningStyleResults => {
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
