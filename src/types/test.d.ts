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
