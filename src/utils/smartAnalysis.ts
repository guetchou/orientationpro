
import { TestResult } from '@/types/test';
import { AIEnhancedAnalysis } from '@/types/test';

/**
 * Analyzes test results and generates enhanced AI insights
 * @param testResult - The test result to analyze
 * @returns AI enhanced analysis with personalized insights
 */
export function generateSmartAnalysis(testResult: TestResult): AIEnhancedAnalysis {
  if (!testResult) {
    return createErrorAnalysis("No test result provided");
  }

  try {
    const testType = testResult.test_type || "unknown";
    
    // Based on the test type, generate appropriate analysis
    switch (testType.toLowerCase()) {
      case "riasec":
        return analyzeRiasecTest(testResult);
      case "learning_style":
        return analyzeLearningStyleTest(testResult);
      case "emotional":
        return analyzeEmotionalTest(testResult);
      case "multiple_intelligence":
        return analyzeMultipleIntelligenceTest(testResult);
      case "career_transition":
        return analyzeCareerTransitionTest(testResult);
      case "no_diploma_career":
        return analyzeNoDiplomaCareerTest(testResult);
      case "retirement_readiness":
        return analyzeRetirementReadinessTest(testResult);
      case "senior_employment":
        return analyzeSeniorEmploymentTest(testResult);
      default:
        return createGenericAnalysis(testResult);
    }
  } catch (error) {
    console.error("Error analyzing test results:", error);
    return createErrorAnalysis("Failed to analyze test results");
  }
}

// Helper function to create analysis for RIASEC tests
function analyzeRiasecTest(testResult: TestResult): AIEnhancedAnalysis {
  // For an actual implementation, we would parse the result data
  // and generate insights based on the RIASEC categories
  
  // This is a simplified mock implementation
  return {
    testType: "RIASEC",
    dominantTraits: ["Investigative", "Artistic", "Social"],
    traitCombinations: ["Investigative + Artistic", "Social + Conventional"],
    strengths: [
      "Strong analytical abilities",
      "Creative problem-solving approach",
      "Good interpersonal skills"
    ],
    weaknesses: [
      "May need to develop more practical skills",
      "Could benefit from more structure in approach"
    ],
    recommendations: [
      "Consider careers in research, design, or education",
      "Develop a structured approach to harness creative abilities",
      "Leverage social skills in collaborative environments"
    ]
  };
}

// Helper function to create analysis for Learning Style tests
function analyzeLearningStyleTest(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: "Learning Style",
    dominantTraits: ["Visual Learner", "Kinesthetic Elements", "Reading/Writing"],
    traitCombinations: ["Visual + Reading/Writing", "Occasional Auditory learning"],
    strengths: [
      "Excellent at processing visual information",
      "Good at taking notes and reading material",
      "Can learn through practical activities"
    ],
    weaknesses: [
      "May struggle with purely auditory lessons",
      "Could improve on group learning scenarios"
    ],
    recommendations: [
      "Use diagrams, charts and visual aids when studying",
      "Take detailed notes during lectures",
      "Try hands-on activities to reinforce learning"
    ]
  };
}

// Helper function to create analysis for Emotional tests
function analyzeEmotionalTest(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: "Intelligence Émotionnelle",
    dominantTraits: ["Forte empathie", "Bonne conscience de soi", "Communication efficace"],
    traitCombinations: ["Empathie + Communication", "Conscience de soi + Autorégulation"],
    strengths: [
      "Excellente compréhension des émotions des autres",
      "Capacité à communiquer efficacement dans diverses situations",
      "Bonne gestion des émotions personnelles"
    ],
    weaknesses: [
      "Parfois trop absorbé par les émotions des autres",
      "Pourrait améliorer l'équilibre émotionnel sous pression"
    ],
    recommendations: [
      "Envisager des carrières dans le conseil, les ressources humaines ou l'éducation",
      "Pratiquer des techniques de pleine conscience pour l'équilibre émotionnel",
      "Utiliser vos compétences en communication pour résoudre les conflits"
    ]
  };
}

// Helper function to create analysis for Multiple Intelligence tests
function analyzeMultipleIntelligenceTest(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: "Intelligence Multiple",
    dominantTraits: ["Intelligence logique-mathématique", "Intelligence linguistique", "Intelligence interpersonnelle"],
    traitCombinations: ["Logique + Linguistique", "Interpersonnelle + Intrapersonnelle"],
    strengths: [
      "Excellente capacité d'analyse et de raisonnement",
      "Communication verbale et écrite efficace",
      "Bonne compréhension des autres et de leurs motivations"
    ],
    weaknesses: [
      "Pourrait développer davantage les intelligences spatiale et corporelle-kinesthésique",
      "Tendance occasionnelle à suranalyser"
    ],
    recommendations: [
      "Envisager des carrières en ingénierie, écriture ou leadership",
      "Explorer des activités pour développer d'autres types d'intelligences",
      "Utiliser les forces analytiques et communicatives en tandem"
    ]
  };
}

// Helper function to create analysis for Career Transition tests
function analyzeCareerTransitionTest(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: "Transition de Carrière",
    dominantTraits: ["Adaptabilité", "Compétences transférables", "Agilité d'apprentissage"],
    traitCombinations: ["Adaptabilité + Apprentissage continu", "Compétences transférables + Résilience"],
    strengths: [
      "Forte capacité à s'adapter à de nouveaux environnements",
      "Ensemble solide de compétences applicables à différents domaines",
      "Aptitude à acquérir rapidement de nouvelles connaissances"
    ],
    weaknesses: [
      "Pourrait bénéficier d'un réseau professionnel plus développé",
      "Anxiété occasionnelle face au changement"
    ],
    recommendations: [
      "Explorer des carrières qui valorisent vos compétences transférables",
      "Investir dans le développement de réseaux professionnels",
      "Suivre des formations ciblées pour combler les lacunes spécifiques"
    ]
  };
}

// Helper function to create analysis for No Diploma Career tests
function analyzeNoDiplomaCareerTest(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: "Carrière Sans Diplôme",
    dominantTraits: ["Compétences pratiques", "Éthique de travail", "Capacité d'auto-apprentissage"],
    traitCombinations: ["Compétences pratiques + Auto-apprentissage", "Éthique de travail + Résolution de problèmes"],
    strengths: [
      "Solides compétences pratiques applicables immédiatement",
      "Forte éthique de travail et fiabilité",
      "Capacité à apprendre indépendamment"
    ],
    weaknesses: [
      "Pourrait bénéficier de certifications professionnelles",
      "Manque occasionnel de confiance en l'absence de diplôme"
    ],
    recommendations: [
      "Explorer les métiers qui valorisent l'expérience et les compétences pratiques",
      "Envisager des certifications professionnelles ciblées",
      "Mettre en avant les réalisations concrètes plutôt que les diplômes"
    ]
  };
}

// Helper function to create analysis for Retirement Readiness tests
function analyzeRetirementReadinessTest(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: "Préparation à la Retraite",
    dominantTraits: ["Conscience financière", "Planification de la santé", "Activités significatives"],
    traitCombinations: ["Planification financière + Activités significatives", "Santé + Connexions sociales"],
    strengths: [
      "Bonne préparation financière pour l'avenir",
      "Attention à la santé et au bien-être",
      "Recherche d'activités significatives pour la retraite"
    ],
    weaknesses: [
      "Pourrait renforcer les connexions sociales pour la retraite",
      "Anxiété occasionnelle face à la transition"
    ],
    recommendations: [
      "Continuer à développer un plan financier solide",
      "Explorer de nouvelles activités et hobbies avant la retraite",
      "Renforcer les relations sociales pour assurer un soutien"
    ]
  };
}

// Helper function to create analysis for Senior Employment tests
function analyzeSeniorEmploymentTest(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: "Emploi Senior",
    dominantTraits: ["Valorisation de l'expérience", "Adaptation technologique", "Équilibre vie-travail"],
    traitCombinations: ["Expérience + Mentorat", "Adaptation technologique + Apprentissage continu"],
    strengths: [
      "Vaste expérience professionnelle et sagesse accumulée",
      "Capacité d'adaptation aux nouvelles technologies",
      "Compétences de mentorat et de leadership"
    ],
    weaknesses: [
      "Pourrait bénéficier d'une mise à jour des compétences numériques avancées",
      "Préoccupation occasionnelle concernant la perception de l'âge"
    ],
    recommendations: [
      "Explorer des rôles de mentorat ou de conseil",
      "Envisager des emplois à temps partiel ou flexibles",
      "Mettre en avant l'expérience et la sagesse comme atouts uniques"
    ]
  };
}

// Create a generic analysis for unknown test types
function createGenericAnalysis(testResult: TestResult): AIEnhancedAnalysis {
  return {
    testType: testResult.test_type || "Évaluation générale",
    dominantTraits: ["Approche analytique", "Orientation vers les résultats", "Adaptabilité"],
    traitCombinations: ["Analyse + Action", "Adaptabilité + Persévérance"],
    strengths: [
      "Capacité à analyser les situations complexes",
      "Détermination à atteindre les objectifs",
      "Flexibilité face aux changements"
    ],
    weaknesses: [
      "Pourrait améliorer l'équilibre entre réflexion et action",
      "Tendance occasionnelle à trop analyser"
    ],
    recommendations: [
      "Utiliser les forces analytiques dans la prise de décision",
      "Équilibrer la réflexion avec l'action concrète",
      "Exploiter l'adaptabilité comme avantage compétitif"
    ]
  };
}

// Create an error analysis when something goes wrong
function createErrorAnalysis(errorMessage: string): AIEnhancedAnalysis {
  return {
    testType: "unknown",
    dominantTraits: [],
    traitCombinations: [],
    strengths: [],
    weaknesses: [],
    recommendations: [],
    error: errorMessage
  };
}

// For backward compatibility
export const analyzeTestResults = generateSmartAnalysis;
