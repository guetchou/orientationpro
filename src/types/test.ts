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
