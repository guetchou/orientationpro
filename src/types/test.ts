
export interface TestResult {
  id: string;
  user_id: string;
  test_type: string;
  results: any;
  answers: any[];
  created_at: string;
  progress_score: number;
}

export interface TestHistoryItem {
  id: string;
  testType: string;
  date: string;
  score: number;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface RiasecResults {
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

export interface LearningStyleResults {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  dominantStyle: string;
  confidenceScore: number;
  primary?: string;
  secondary?: string;
  recommendations?: string[];
  recommendedStrategies?: string[];
}

export interface EmotionalResults {
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  dominantTrait: string;
  confidenceScore: number;
  overallScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  selfManagement?: number;
  socialAwareness?: number;
  relationshipManagement?: number;
  areasToImprove?: string[];
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
  dominantIntelligences: string[];
  confidenceScore: number;
}

export interface CareerTransitionResults {
  currentSatisfaction: number;
  skillTransferability: number;
  adaptability: number;
  riskTolerance: number;
  recommendedPaths: string[];
  confidenceScore: number;
  learningCapacity?: number;
  networkingStrength?: number;
  transitionReadiness?: number;
  recommendedSectors?: string[];
}

export interface SeniorEmploymentResults {
  experienceValue: number;
  technologyAdaptation: number;
  workLifeBalance: number;
  mentorshipPotential: number;
  recommendedRoles: string[];
  confidenceScore: number;
}

export interface RetirementReadinessResults {
  financialPreparation: number;
  healthPlanning: number;
  socialConnections: number;
  purposeClarity: number;
  leisureInterests: number;
  readinessLevel: string;
  confidenceScore: number;
  socialPlanning?: number;
  activityPlanning?: number;
  readinessScore?: number;
  recommendedSteps?: string[];
}

export interface NoDiplomaCareerResults {
  practicalSkills: number;
  entrepreneurialAptitude: number;
  tradeInterest: number;
  selfLearningCapacity: number;
  recommendedPaths: string[];
  confidenceScore: number;
  careerPotential?: number;
  resilience?: number;
  socialIntelligence?: number; 
  experiencePortfolio?: number;
  recommendedFields?: string[];
  creativity?: number;
  entrepreneurialSpirit?: number;
}

export interface AIEnhancedAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  careerSuggestions?: string[];
  analysis: string;
  confidenceScore: number;
}
