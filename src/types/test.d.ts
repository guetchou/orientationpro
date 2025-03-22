
// Base interfaces
export interface TestResult {
  id: string;
  userId: string;
  testType: string;
  createdAt: string;
  score?: number;
  isPremium?: boolean;
}

export interface TestHistoryItem extends TestResult {
  testName: string;
  completedDate: string;
  scoreDescription?: string;
}

// Different test result types
export interface RiasecResults extends TestResult {
  dominant: string[];
  scores: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  recommendations?: string[];
  jobMatches?: string[];
}

export interface EmotionalResults extends TestResult {
  emotionalAwareness: number;
  emotionalRegulation: number;
  socialAwareness: number;
  relationshipManagement: number;
  overallScore: number;
}

export interface LearningStyleResults extends TestResult {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  primary: string;
  secondary: string;
}

export interface MultipleIntelligenceResults extends TestResult {
  linguistic: number;
  logical: number;
  spatial: number;
  musical: number;
  bodily: number;
  interpersonal: number;
  intrapersonal: number;
  naturalistic: number;
  dominant: string[];
}

export interface CareerTransitionResults extends TestResult {
  transferableSkills: number;
  adaptability: number;
  riskTolerance: number;
  networkStrength: number;
  learningCapacity: number;
  overallReadiness: number;
}

export interface NoDiplomaCareerResults extends TestResult {
  skillAssessment: number;
  workEthic: number;
  problemSolving: number;
  communication: number;
  experiencePortfolio: number;
  overallPotential: number;
}

export interface RetirementReadinessResults extends TestResult {
  financialPreparedness: number;
  healthStatus: number;
  socialConnections: number;
  purposeClarity: number;
  readinessScore: number;
  recommendedActions: string[];
}

export interface SeniorEmploymentResults extends TestResult {
  techCompetency: number;
  physicalCapability: number;
  adaptability: number;
  experienceValue: number;
  flexibilityNeeds: number;
  employmentPotential: number;
}

// AI Analysis types
export interface AIEnhancedAnalysis {
  dominantTraits: string[];
  traitStrengths: Record<string, number>;
  traitCombinations: string[];
  rawScores: any;
  analysisVersion: string;
  testType: string;
  error?: string;
}

// Recommendation types
export interface CareerRecommendation {
  title: string;
  match: number;
  description: string;
  skills: string[];
  education: string[];
  outlook: string;
}

export interface EducationRecommendation {
  institution: string;
  program: string;
  match: number;
  description: string;
  duration: string;
  cost: string;
  location: string;
}

export interface SkillRecommendation {
  skill: string;
  relevance: number;
  description: string;
  resources: string[];
  timeToAcquire: string;
}
