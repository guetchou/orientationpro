
export interface TestResult {
  id: string;
  created_at: string;
  user_id: string;
  test_type: string;
  results: any;
  result_data?: any;
  score?: number;
  answers?: any[];
  progress_score?: number;
}

export interface AIEnhancedAnalysis {
  testType: string;
  dominantTraits: string[];
  traitCombinations: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidenceScore?: number;
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
  selfAwareness: number;
  selfRegulation: number;
  motivation: number;
  empathy: number;
  socialSkills: number;
  overallScore?: number;
  strengths?: string[];
  areasToImprove?: string[];
  confidenceScore?: number;
  dominantTrait?: string;
  // Legacy properties
  emotional_awareness?: number;
  emotional_regulation?: number;
}

export interface LearningStyleResults {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  dominantStyle?: string;
  primary?: string;
  secondary?: string;
  recommendedStrategies?: string[];
  confidenceScore?: number;
  // Legacy properties
  reading_writing?: number;
}

export interface NoDiplomaCareerResults {
  practicalSkills: number;
  entrepreneurialAptitude: number;
  tradeInterest: number;
  selfLearningCapacity: number;
  recommendedPaths?: string[];
  confidenceScore?: number;
  experiencePortfolio?: number;
  careerPotential?: number;
  // Legacy properties
  practical_skills?: number;
  technical_aptitude?: number;
  soft_skills?: number;
  adaptability?: number;
}

export interface RetirementReadinessResults {
  financialPreparation: number;
  healthPlanning: number;
  socialConnections: number;
  purposeClarity: number;
  leisureInterests: number;
  readinessLevel?: string;
  readinessScore?: number;
  recommendedSteps?: string[];
  confidenceScore?: number;
  // Legacy properties
  financial_preparedness?: number;
  health_wellness?: number;
  purpose_planning?: number;
}

export interface SeniorEmploymentResults {
  experienceValue: number;
  technologyAdaptation: number;
  workLifeBalance: number;
  mentorshipPotential: number;
  recommendedRoles?: string[];
  confidenceScore?: number;
  flexibilityNeeds?: number;
  marketValue?: number;
  // Legacy properties
  tech_skills?: number;
  adaptability?: number;
  mentorship_capacity?: number;
  work_life_balance?: number;
}

export interface CareerTransitionResults {
  currentSatisfaction: number;
  skillTransferability: number;
  adaptability: number;
  riskTolerance: number;
  learningCapacity?: number;
  recommendedSectors?: string[];
  recommendedPaths?: string[];
  transitionReadiness?: number;
  confidenceScore?: number;
  // Legacy properties
  transferable_skills?: number;
  adaptability_quotient?: number;
  new_field_readiness?: number;
  networking_capacity?: number;
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

export interface RiasecResults {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  personalityCode?: string;
  dominantTypes: string[];
  confidenceScore?: number;
}
