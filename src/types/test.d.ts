
// Types for different test results
export interface RiasecResults {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  personalityCode: string;
  confidenceScore: number;
  dominantTypes: string[];
}

export interface EmotionalResults {
  selfAwareness: number;
  selfManagement: number;
  socialAwareness: number;
  relationshipManagement: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  selfRegulation?: number;
  motivation?: number;
  empathy?: number;
  socialSkills?: number;
  areasToImprove?: string[];
  confidenceScore?: number;
  dominantTrait?: string;
}

export interface LearningStyleResults {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
  primary: string;
  secondary: string;
  recommendations: string[];
  dominantStyle?: string;
  recommendedStrategies?: string[];
  confidenceScore?: number;
}

export interface MultipleIntelligenceResults {
  logical: number;
  musical: number;
  spatial: number;
  bodily: number;
  interpersonal: number;
  intrapersonal: number;
  naturalist: number;
  linguistic: number;
  dominantIntelligence: string;
  secondaryIntelligence: string;
}

export interface CareerTransitionResults {
  adaptability: number;
  flexibility: number;
  riskTolerance: number;
  networkingStrength: number;
  skillTransferability: number;
  learningCapacity: number;
  recommendedPaths: string[];
  currentSatisfaction?: number;
  recommendedSectors?: string[];
  transitionReadiness?: number;
  confidenceScore?: number;
}

export interface NoDiplomaCareerResults {
  practicalSkills: number;
  creativity: number;
  entrepreneurialSpirit: number;
  resilience: number;
  socialIntelligence: number;
  experiencePortfolio: number;
  careerPotential: number;
  recommendedFields: string[];
  entrepreneurialAptitude?: number;
  tradeInterest?: number;
  selfLearningCapacity?: number;
  recommendedPaths?: string[];
  confidenceScore?: number;
}

export interface RetirementReadinessResults {
  financialPreparation: number;
  mentalReadiness: number;
  socialPlanning: number;
  activityPlanning: number;
  readinessScore: number;
  recommendedSteps: string[];
  healthPlanning?: number;
  socialConnections?: number;
  purposeClarity?: number;
  leisureInterests?: number;
  readinessLevel?: string;
  confidenceScore?: number;
}

export interface SeniorEmploymentResults {
  digitalLiteracy: number;
  physicalCapacity: number;
  adaptability: number;
  relevantExperience: number;
  motivationLevel: number;
  flexibilityNeeds: number;
  recommendedSectors: string[];
  experienceValue?: number;
  technologyAdaptation?: number;
  workLifeBalance?: number;
  mentorshipPotential?: number;
  recommendedRoles?: string[];
  confidenceScore?: number;
}

// AIEnhancedAnalysis interface for test analysis
export interface AIEnhancedAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  careerSuggestions?: string[];
  analysis: string;
  confidenceScore: number;
}

// Generic types for all tests
export interface TestResult {
  id: string;
  user_id: string;
  test_type: string;
  created_at: string;
  answers: unknown[]; // Peut être affiné selon le test
  progress_score: number;
  results: unknown; // Peut être affiné selon le test
}
