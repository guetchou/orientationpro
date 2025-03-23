
export interface TestResult {
  id: string;
  created_at: string;
  user_id: string;
  test_type: string;
  result_data: any;
  score?: number;
}

export interface AIEnhancedAnalysis {
  testType: string;
  dominantTraits: string[];
  traitCombinations: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  error?: string;
}

export interface CareerRecommendation {
  title: string;
  description: string;
  averageSalary: number;
  educationLevel: string;
  skills: string[];
}

// Additional test result types needed by test pages
export interface EmotionalResults {
  emotional_awareness: number;
  emotional_regulation: number;
  empathy: number;
  social_skills: number;
}

export interface LearningStyleResults {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading_writing: number;
}

export interface NoDiplomaCareerResults {
  practical_skills: number;
  technical_aptitude: number;
  soft_skills: number;
  adaptability: number;
}

export interface RetirementReadinessResults {
  financial_preparedness: number;
  health_wellness: number;
  social_connections: number;
  purpose_planning: number;
}

export interface SeniorEmploymentResults {
  tech_skills: number;
  adaptability: number;
  mentorship_capacity: number;
  work_life_balance: number;
}

export interface CareerTransitionResults {
  transferable_skills: number;
  adaptability_quotient: number;
  new_field_readiness: number;
  networking_capacity: number;
}
