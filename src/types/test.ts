
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

export interface EmotionalResults {
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  dominantTrait: string;
  overallScore: number;
  strengths: string[];
  areasToImprove: string[];
  confidenceScore: number;
}

export interface LearningStyleResults {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading?: number;
  primary: string;
  secondary: string;
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
  learningCapacity: number;
  recommendedSectors: string[];
  recommendedPaths: string[];
  transitionReadiness: number;
  confidenceScore: number;
}

export interface NoDiplomaCareerResults {
  practicalSkills: number;
  creativity: number;
  entrepreneurialAptitude: number;
  selfLearningCapacity: number;
  socialIntelligence: number;
  resilience: number;
  careerPotential: number;
  experiencePortfolio: number;
  entrepreneurialSpirit: number;
  tradeInterest: number;
  recommendedFields: string[];
  recommendedPaths: string[];
  confidenceScore: number;
}

export interface AIEnhancedAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  careerSuggestions?: string[];
  developmentSuggestions?: string[];
  learningPathways?: string[];
  analysis: string;
  confidenceScore: number;
}
