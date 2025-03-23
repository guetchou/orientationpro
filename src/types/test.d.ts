
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
}

export interface LearningStyleResults {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
  primary: string;
  secondary: string;
  recommendations: string[];
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
}

export interface RetirementReadinessResults {
  financialPreparation: number;
  mentalReadiness: number;
  socialPlanning: number;
  activityPlanning: number;
  readinessScore: number;
  recommendedSteps: string[];
}

export interface SeniorEmploymentResults {
  digitalLiteracy: number;
  physicalCapacity: number;
  adaptability: number;
  relevantExperience: number;
  motivationLevel: number;
  flexibilityNeeds: number;
  recommendedSectors: string[];
}

// Generic types for all tests
export interface TestResult {
  id: string;
  user_id: string;
  test_type: string;
  created_at: string;
  answers: any[];
  progress_score: number;
  results: any;
}

export interface AIEnhancedAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  careerSuggestions?: string[];
  analysis: string;
  confidenceScore: number;
}
