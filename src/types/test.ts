
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
}

export interface EmotionalResults {
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  dominantTrait: string;
  confidenceScore: number;
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
}

export interface NoDiplomaCareerResults {
  practicalSkills: number;
  entrepreneurialAptitude: number;
  tradeInterest: number;
  selfLearningCapacity: number;
  recommendedPaths: string[];
  confidenceScore: number;
}
