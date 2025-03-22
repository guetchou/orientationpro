
export interface TestResult {
  id: string;
  user_id: string;
  test_type: string;
  results: any;
  answers: any[];
  created_at: string;
  progress_score: number;
  confidence_score?: number;
  personality_code?: string;
}

export interface LearningStyleResults {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  primary?: string;
  secondary?: string;
  recommendedStrategies?: string[];
  confidenceScore?: number;
}

export interface EmotionalTestResults {
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  overallScore?: number;
  strengths?: string[];
  areasToImprove?: string[];
  confidenceScore?: number;
}

export interface RiasecResults {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  dominantTypes?: string[];
  personalityCode?: string;
  confidenceScore?: number;
}

export interface MultipleIntelligenceResults {
  linguistic: number;
  logical: number;
  spatial: number;
  musical: number;
  bodily: number;
  interpersonal: number;
  intrapersonal: number;
  naturalist: number;
  dominantIntelligences?: string[];
  confidenceScore?: number;
}

// IA-Enhanced test analysis types
export interface AIEnhancedAnalysis {
  personalityInsights: string[];
  careerRecommendations: string[];
  learningPathways: string[];
  strengthWeaknessAnalysis: string[];
  compatibilityMatrix?: {[key: string]: number};
  developmentSuggestions: string[];
  confidenceScore: number;
}

// Career transition test results
export interface CareerTransitionResults {
  currentSatisfaction: number;
  skillTransferability: number;
  adaptability: number;
  riskTolerance: number;
  learningCapacity: number;
  recommendedSectors?: string[];
  transitionReadiness?: number;
  confidenceScore?: number;
}

// Retirement readiness test results
export interface RetirementReadinessResults {
  financialPreparation: number;
  healthPlanning: number;
  socialConnections: number;
  purposeClarity: number;
  leisureInterests: number;
  readinessScore?: number;
  actionPriorities?: string[];
  confidenceScore?: number;
}

// Senior employment test results
export interface SeniorEmploymentResults {
  experienceValue: number;
  technologyAdaptation: number;
  workLifeBalance: number;
  mentorshipPotential: number;
  flexibilityNeeds: number;
  employabilityScore?: number;
  recommendedRoles?: string[];
  confidenceScore?: number;
}

// No diploma career test results
export interface NoDiplomaCareerResults {
  practicalSkills: number;
  entrepreneurialAptitude: number;
  tradeInterest: number;
  selfLearningCapacity: number;
  experiencePortfolio: number;
  careerPotential?: number;
  recommendedPaths?: string[];
  confidenceScore?: number;
}
