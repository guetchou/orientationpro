
// Extending the TestResults type
export type TestResults = 
  | RiasecResults 
  | EmotionalTestResults 
  | MultipleIntelligenceResults 
  | LearningStyleResults
  | CareerTransitionResults
  | RetirementReadinessResults
  | SeniorEmploymentResults
  | NoDiplomaCareerResults;

// AI Enhanced Analysis Type
export interface AIEnhancedAnalysis {
  personalityInsights: string[];
  careerRecommendations: string[];
  learningPathways: string[];
  strengthWeaknessAnalysis: string[];
  developmentSuggestions: string[];
  confidenceScore: number;
}

// RIASEC Test Results
export interface RiasecResults {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  primaryType: string;
  secondaryType: string;
  confidenceScore?: number;
}

// Emotional Intelligence Test Results
export interface EmotionalTestResults {
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  overallScore: number;
  dominantArea: string;
  confidenceScore?: number;
}

// Multiple Intelligence Test Results
export interface MultipleIntelligenceResults {
  linguistic: number;
  logicalMathematical: number;
  spatial: number;
  musical: number;
  bodily: number;
  interpersonal: number;
  intrapersonal: number;
  naturalistic: number;
  dominantIntelligences: string[];
  confidenceScore?: number;
}

// Learning Style Test Results
export interface LearningStyleResults {
  visual: number;
  auditory: number;
  kinesthetic: number;
  dominantStyle: string;
  secondaryStyle: string;
  confidenceScore?: number;
}

// Career Transition Test Results
export interface CareerTransitionResults {
  readiness: number;
  skillTransferability: number;
  adaptability: number;
  motivationLevel: number;
  riskTolerance: number;
  overallScore: number;
  recommendedApproach: string;
  confidenceScore?: number;
}

// Retirement Readiness Test Results
export interface RetirementReadinessResults {
  financialPreparation: number;
  emotionalReadiness: number;
  socialPlanning: number;
  healthConsiderations: number;
  purposeAndIdentity: number;
  overallReadiness: number;
  primaryConcern: string;
  confidenceScore?: number;
}

// Senior Employment Test Results
export interface SeniorEmploymentResults {
  techProficiency: number;
  adaptability: number;
  workLifeBalanceNeeds: number;
  skillRelevance: number;
  confidenceLevel: number;
  overallScore: number;
  recommendedSectors: string[];
  confidenceScore?: number;
}

// No Diploma Career Test Results
export interface NoDiplomaCareerResults {
  technicalSkills: number;
  softSkills: number;
  entrepreneurialSpirit: number;
  experienceLevel: number;
  learningAgility: number;
  overallPotential: number;
  recommendedPaths: string[];
  confidenceScore?: number;
}
