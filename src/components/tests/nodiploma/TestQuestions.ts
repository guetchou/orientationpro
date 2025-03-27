
// Define questions for the No Diploma Career Test
export interface TestQuestion {
  id: number;
  question: string;
  category: string;
  options: {
    value: number;
    label: string;
  }[];
}

// Import question categories
import { manualSkillsQuestions } from "./question-categories/ManualSkillsQuestions";
import { serviceOrientationQuestions } from "./question-categories/ServiceOrientationQuestions";
import { salesQuestions } from "./question-categories/SalesQuestions";
import { technologyQuestions } from "./question-categories/TechnologyQuestions";
import { creativityQuestions } from "./question-categories/CreativityQuestions";

// Combine all questions
export const careerTestQuestions: TestQuestion[] = [
  ...manualSkillsQuestions,
  ...serviceOrientationQuestions,
  ...salesQuestions,
  ...technologyQuestions,
  ...creativityQuestions
];

export interface NoDiplomaCareerResults {
  manual_skills?: number;
  service_orientation?: number;
  sales_aptitude?: number;
  creativity?: number;
  outdoor?: number;
  tech_aptitude?: number;
  learning_attitude?: number;
  stress_tolerance?: number;
  schedule_preference?: number;
  teamwork?: number;
  communication_skills?: number;
  traditional_trade_interest?: number;
  responsibility?: number;
  customer_service?: number;
  organization?: number;
  recommended_jobs?: string[];
  career_paths?: string[];
  strengths?: string[];
  challenges?: string[];
  training_recommendations?: string[];
  recommendedFields?: string[];
  recommendedPaths?: string[];
  entrepreneurialAptitude?: number;
  selfLearningCapacity?: number;
  practicalSkills?: number;
  socialIntelligence?: number;
  resilience?: number;
  experiencePortfolio?: number;
  careerPotential?: number;
  entrepreneurialSpirit?: number;
  tradeInterest?: number;
  confidenceScore?: number;
  aiInsights?: {
    careerPath?: string;
    potential?: number;
    summary?: string;
    recommendations?: string[];
  };
}
