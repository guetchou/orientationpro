
import { 
  RiasecResults, 
  TestResult, 
  LearningStyleResults,
  EmotionalResults,
  MultipleIntelligenceResults,
  CareerTransitionResults,
  NoDiplomaCareerResults,
  RetirementReadinessResults,
  SeniorEmploymentResults,
  AIEnhancedAnalysis
} from '@/types/test';

// Generic analysis function that routes to specific analyzers based on test type
export const analyzeTestResult = (result: TestResult): any => {
  switch (result.testType) {
    case 'riasec':
      return analyzeRiasecResult(result as RiasecResults);
    case 'learningStyle':
      return analyzeLearningStyleResult(result as LearningStyleResults);
    case 'emotional':
      return analyzeEmotionalResult(result as EmotionalResults);
    case 'multipleIntelligence':
      return analyzeMultipleIntelligenceResult(result as MultipleIntelligenceResults);
    case 'careerTransition':
      return analyzeCareerTransitionResult(result as CareerTransitionResults);
    case 'noDiplomaCareer':
      return analyzeNoDiplomaCareerResult(result as NoDiplomaCareerResults);
    case 'retirementReadiness':
      return analyzeRetirementReadinessResult(result as RetirementReadinessResults);
    case 'seniorEmployment':
      return analyzeSeniorEmploymentResult(result as SeniorEmploymentResults);
    default:
      return {
        summary: "Analyse non disponible pour ce type de test.",
        details: {},
        recommendations: []
      };
  }
};

// RIASEC test analysis
const analyzeRiasecResult = (result: RiasecResults) => {
  const { scores } = result;
  
  // Get top three RIASEC categories
  const sortedCategories = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => capitalize(category));
  
  // Career paths based on top RIASEC combo
  const topTwo = sortedCategories.slice(0, 2).join('-');
  const careerPaths = getCareerPathsForRiasecCombo(topTwo);
  
  return {
    summary: `Votre profil RIASEC montre une forte affinité pour les domaines ${sortedCategories.join(', ')}.`,
    details: {
      dominant: sortedCategories,
      strengths: getStrengthsForRiasecCategories(sortedCategories),
      workEnvironments: getWorkEnvironmentsForRiasecCategories(sortedCategories),
    },
    recommendations: careerPaths
  };
};

// Learning Style test analysis
const analyzeLearningStyleResult = (result: LearningStyleResults) => {
  const { visual, auditory, kinesthetic, reading } = result;
  
  // Determine primary and secondary learning styles
  const styles = [
    { type: 'visual', score: visual },
    { type: 'auditory', score: auditory },
    { type: 'kinesthetic', score: kinesthetic },
    { type: 'reading/writing', score: reading }
  ].sort((a, b) => b.score - a.score);
  
  const primary = styles[0].type;
  const secondary = styles[1].type;
  
  return {
    summary: `Votre style d'apprentissage principal est ${primary}, suivi de ${secondary}.`,
    details: {
      primary,
      secondary,
      learningStrategies: getLearningStrategiesForStyle(primary),
      complementaryStrategies: getLearningStrategiesForStyle(secondary),
    },
    recommendations: getEducationalRecommendationsForLearningStyle(primary)
  };
};

// Emotional Intelligence test analysis
const analyzeEmotionalResult = (result: EmotionalResults) => {
  const { emotionalAwareness, emotionalRegulation, socialAwareness, relationshipManagement, overallScore } = result;
  
  // Determine strengths and areas for improvement
  const scores = [
    { area: 'conscience émotionnelle', score: emotionalAwareness },
    { area: 'régulation émotionnelle', score: emotionalRegulation },
    { area: 'conscience sociale', score: socialAwareness },
    { area: 'gestion des relations', score: relationshipManagement }
  ].sort((a, b) => b.score - a.score);
  
  const strengths = scores.slice(0, 2).map(s => s.area);
  const improvements = scores.slice(2).map(s => s.area);
  
  return {
    summary: `Votre intelligence émotionnelle globale est ${getScoreCategory(overallScore)}.`,
    details: {
      strengths,
      improvementAreas: improvements,
      overallCategory: getScoreCategory(overallScore)
    },
    recommendations: getEmotionalIntelligenceRecommendations(improvements)
  };
};

// Multiple Intelligence test analysis
const analyzeMultipleIntelligenceResult = (result: MultipleIntelligenceResults) => {
  const { linguistic, logical, spatial, musical, bodily, interpersonal, intrapersonal, naturalistic } = result;
  
  // Determine top intelligences
  const intelligences = [
    { type: 'linguistique', score: linguistic },
    { type: 'logico-mathématique', score: logical },
    { type: 'spatiale', score: spatial },
    { type: 'musicale', score: musical },
    { type: 'kinesthésique', score: bodily },
    { type: 'interpersonnelle', score: interpersonal },
    { type: 'intrapersonnelle', score: intrapersonal },
    { type: 'naturaliste', score: naturalistic }
  ].sort((a, b) => b.score - a.score);
  
  const topIntelligences = intelligences.slice(0, 3).map(i => i.type);
  
  return {
    summary: `Vos intelligences dominantes sont ${topIntelligences.join(', ')}.`,
    details: {
      dominant: topIntelligences,
      strengthAreas: getStrengthsForIntelligences(topIntelligences),
      learningPreferences: getLearningPreferencesForIntelligences(topIntelligences)
    },
    recommendations: getCareerRecommendationsForIntelligences(topIntelligences)
  };
};

// Career Transition test analysis
const analyzeCareerTransitionResult = (result: CareerTransitionResults) => {
  const { transferableSkills, adaptability, riskTolerance, networkStrength, learningCapacity, overallReadiness } = result;
  
  // Determine readiness level
  const readinessLevel = getReadinessLevel(overallReadiness);
  
  // Identify strengths and challenges
  const factors = [
    { factor: 'compétences transférables', score: transferableSkills },
    { factor: 'adaptabilité', score: adaptability },
    { factor: 'tolérance au risque', score: riskTolerance },
    { factor: 'réseau professionnel', score: networkStrength },
    { factor: 'capacité d\'apprentissage', score: learningCapacity }
  ].sort((a, b) => b.score - a.score);
  
  const strengths = factors.slice(0, 2).map(f => f.factor);
  const challenges = factors.slice(-2).map(f => f.factor);
  
  return {
    summary: `Votre niveau de préparation pour une transition de carrière est ${readinessLevel}.`,
    details: {
      readinessLevel,
      strengths,
      challenges
    },
    recommendations: getCareerTransitionRecommendations(readinessLevel, challenges)
  };
};

// No Diploma Career test analysis
const analyzeNoDiplomaCareerResult = (result: NoDiplomaCareerResults) => {
  const { skillAssessment, workEthic, problemSolving, communication, experiencePortfolio, overallPotential } = result;
  
  // Determine potential level
  const potentialLevel = getPotentialLevel(overallPotential);
  
  // Identify strengths and areas for development
  const factors = [
    { factor: 'compétences existantes', score: skillAssessment },
    { factor: 'éthique de travail', score: workEthic },
    { factor: 'résolution de problèmes', score: problemSolving },
    { factor: 'communication', score: communication },
    { factor: 'portfolio d\'expérience', score: experiencePortfolio }
  ].sort((a, b) => b.score - a.score);
  
  const strengths = factors.slice(0, 2).map(f => f.factor);
  const development = factors.slice(-2).map(f => f.factor);
  
  return {
    summary: `Votre potentiel de carrière sans diplôme est ${potentialLevel}.`,
    details: {
      potentialLevel,
      strengths,
      developmentAreas: development
    },
    recommendations: getNoDiplomaCareerRecommendations(potentialLevel, strengths)
  };
};

// Retirement Readiness test analysis
const analyzeRetirementReadinessResult = (result: RetirementReadinessResults) => {
  const { financialPreparedness, healthStatus, socialConnections, purposeClarity, readinessScore } = result;
  
  // Determine readiness category
  const readinessCategory = getRetirementReadinessCategory(readinessScore);
  
  // Identify strengths and areas needing attention
  const factors = [
    { factor: 'préparation financière', score: financialPreparedness },
    { factor: 'état de santé', score: healthStatus },
    { factor: 'connexions sociales', score: socialConnections },
    { factor: 'clarté d\'objectif', score: purposeClarity }
  ].sort((a, b) => b.score - a.score);
  
  const strengths = factors.slice(0, 2).map(f => f.factor);
  const attentionAreas = factors.slice(-2).map(f => f.factor);
  
  return {
    summary: `Votre niveau de préparation à la retraite est ${readinessCategory}.`,
    details: {
      readinessCategory,
      strengths,
      attentionAreas
    },
    recommendations: getRetirementRecommendations(readinessCategory, attentionAreas)
  };
};

// Senior Employment test analysis
const analyzeSeniorEmploymentResult = (result: SeniorEmploymentResults) => {
  const { techCompetency, physicalCapability, adaptability, experienceValue, flexibilityNeeds, employmentPotential } = result;
  
  // Determine employment potential category
  const potentialCategory = getSeniorEmploymentCategory(employmentPotential);
  
  // Identify advantages and considerations
  const factors = [
    { factor: 'compétence technologique', score: techCompetency },
    { factor: 'capacité physique', score: physicalCapability },
    { factor: 'adaptabilité', score: adaptability },
    { factor: 'valeur de l\'expérience', score: experienceValue },
    { factor: 'besoins de flexibilité', score: flexibilityNeeds }
  ].sort((a, b) => b.score - a.score);
  
  const advantages = factors.slice(0, 2).map(f => f.factor);
  const considerations = factors.slice(-2).map(f => f.factor);
  
  return {
    summary: `Votre potentiel d'emploi senior est ${potentialCategory}.`,
    details: {
      potentialCategory,
      advantages,
      considerations
    },
    recommendations: getSeniorEmploymentRecommendations(potentialCategory, advantages)
  };
};

// Helper functions for analysis
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const getScoreCategory = (score: number) => {
  if (score >= 80) return 'excellente';
  if (score >= 60) return 'bonne';
  if (score >= 40) return 'moyenne';
  if (score >= 20) return 'à développer';
  return 'faible';
};

const getReadinessLevel = (score: number) => {
  if (score >= 80) return 'très élevé';
  if (score >= 60) return 'élevé';
  if (score >= 40) return 'modéré';
  if (score >= 20) return 'en développement';
  return 'initial';
};

const getPotentialLevel = (score: number) => {
  if (score >= 80) return 'exceptionnel';
  if (score >= 60) return 'fort';
  if (score >= 40) return 'modéré';
  if (score >= 20) return 'à développer';
  return 'limité';
};

const getRetirementReadinessCategory = (score: number) => {
  if (score >= 80) return 'optimal';
  if (score >= 60) return 'bien préparé';
  if (score >= 40) return 'partiellement préparé';
  if (score >= 20) return 'préparation initiale';
  return 'non préparé';
};

const getSeniorEmploymentCategory = (score: number) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'bon';
  if (score >= 40) return 'modéré';
  if (score >= 20) return 'limité';
  return 'restreint';
};

// These functions would be expanded with real data in a production environment
const getStrengthsForRiasecCategories = (categories: string[]) => {
  return [
    'Capacité à résoudre des problèmes complexes',
    'Bonnes compétences interpersonnelles',
    'Créativité et pensée innovante'
  ];
};

const getWorkEnvironmentsForRiasecCategories = (categories: string[]) => {
  return [
    'Environnements collaboratifs',
    'Cadres structurés avec des défis intellectuels',
    'Milieux favorisant l\'expression créative'
  ];
};

const getCareerPathsForRiasecCombo = (combo: string) => {
  return [
    'Développement de produits',
    'Conseil en gestion',
    'Recherche appliquée',
    'Éducation et formation'
  ];
};

const getLearningStrategiesForStyle = (style: string) => {
  const strategies: Record<string, string[]> = {
    'visual': [
      'Utiliser des diagrammes et des cartes mentales',
      'Convertir les notes en schémas visuels',
      'Regarder des vidéos explicatives'
    ],
    'auditory': [
      'Enregistrer et réécouter les cours',
      'Participer à des discussions de groupe',
      'Expliquer les concepts à voix haute'
    ],
    'kinesthetic': [
      'Apprendre par la pratique et l\'expérimentation',
      'Utiliser des modèles physiques',
      'Prendre des pauses actives pendant l\'étude'
    ],
    'reading/writing': [
      'Prendre des notes détaillées',
      'Réécrire les concepts clés',
      'Créer des résumés et des fiches'
    ]
  };
  
  return strategies[style] || [
    'Varier les méthodes d\'apprentissage',
    'Combiner différentes approches',
    'Adapter ses techniques selon le contenu'
  ];
};

const getEducationalRecommendationsForLearningStyle = (style: string) => {
  return [
    'Cours adaptés à votre style d\'apprentissage',
    'Techniques d\'étude optimisées',
    'Outils et ressources recommandés'
  ];
};

const getEmotionalIntelligenceRecommendations = (improvementAreas: string[]) => {
  return [
    'Exercices de pleine conscience',
    'Pratique de l\'écoute active',
    'Journal de réflexion émotionnelle',
    'Techniques de gestion du stress'
  ];
};

const getStrengthsForIntelligences = (intelligences: string[]) => {
  return [
    'Communication efficace',
    'Résolution de problèmes',
    'Expression créative',
    'Empathie et compréhension des autres'
  ];
};

const getLearningPreferencesForIntelligences = (intelligences: string[]) => {
  return [
    'Apprentissage interactif',
    'Exploration de concepts abstraits',
    'Activités créatives',
    'Travail en équipe et collaboration'
  ];
};

const getCareerRecommendationsForIntelligences = (intelligences: string[]) => {
  return [
    'Domaines de recherche et développement',
    'Professions créatives',
    'Rôles de leadership et conseil',
    'Éducation et formation'
  ];
};

const getCareerTransitionRecommendations = (readinessLevel: string, challenges: string[]) => {
  return [
    'Plan de développement de compétences personnalisé',
    'Stratégies de réseautage efficaces',
    'Options de formation continue',
    'Approches de recherche d\'emploi adaptées'
  ];
};

const getNoDiplomaCareerRecommendations = (potentialLevel: string, strengths: string[]) => {
  return [
    'Certifications professionnelles pertinentes',
    'Développement d\'un portfolio de compétences',
    'Stratégies de networking et visibilité',
    'Secteurs et rôles à fort potentiel'
  ];
};

const getRetirementRecommendations = (readinessCategory: string, attentionAreas: string[]) => {
  return [
    'Plan financier ajusté',
    'Activités pour maintenir la santé physique et mentale',
    'Stratégies pour développer de nouvelles relations sociales',
    'Options pour trouver un sens et un but après la carrière'
  ];
};

const getSeniorEmploymentRecommendations = (potentialCategory: string, advantages: string[]) => {
  return [
    'Mise à jour de compétences ciblées',
    'Options d\'emploi adaptées à vos forces',
    'Stratégies de valorisation de votre expérience',
    'Possibilités de mentorat et conseil'
  ];
};

// Function to create a simplified AI analysis from test results
export const createBasicAIAnalysis = (result: TestResult): AIEnhancedAnalysis => {
  const analysis = analyzeTestResult(result);
  
  return {
    dominantTraits: analysis.details.dominant || analysis.details.strengths || [],
    traitStrengths: {},
    traitCombinations: [],
    rawScores: result,
    analysisVersion: "1.0",
    testType: result.testType
  };
};
