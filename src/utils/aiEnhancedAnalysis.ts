
import { TestResult } from "@/types/test";
import { AIEnhancedAnalysis } from "@/types/test";

// Function to generate AI enhanced analysis from test results
export const generateAIEnhancedAnalysis = async (testResult: TestResult): Promise<AIEnhancedAnalysis> => {
  try {
    // This would typically be an API call to a backend service
    // For now, we'll mock a response based on the test type
    const testType = testResult.test_type || "unknown";
    
    // Mock response with basic analysis
    return {
      testType: testType,
      dominantTraits: mockDominantTraits(testType, testResult),
      traitCombinations: ["Analytical thinking + Problem solving", "Creative approach + Practical implementation"],
      strengths: ["Ability to analyze complex information", "Finding innovative solutions", "Adapting to new situations"],
      weaknesses: ["May overthink simple problems", "Occasional difficulty with time management"],
      recommendations: ["Focus on projects requiring analytical thinking", "Consider roles that balance creativity and structure"]
    };
  } catch (error) {
    console.error("Error generating AI enhanced analysis:", error);
    return {
      testType: "unknown",
      dominantTraits: [],
      traitCombinations: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
      error: "Failed to generate analysis"
    };
  }
};

// Helper function to generate mock dominant traits based on test type
const mockDominantTraits = (testType: string, testResult: any): string[] => {
  switch (testType.toLowerCase()) {
    case "riasec":
      return ["Investigative", "Artistic", "Social"];
    case "learning_style":
      return ["Visual learner", "Hands-on approach", "Analytical thinking"];
    case "emotional":
      return ["High empathy", "Good self-awareness", "Effective communication"];
    case "multiple_intelligence":
      return ["Logical-mathematical intelligence", "Linguistic intelligence", "Interpersonal intelligence"];
    case "career_transition":
      return ["Adaptability", "Transferable skills expertise", "Learning agility"];
    case "no_diploma_career":
      return ["Practical skills oriented", "Problem-solving ability", "Self-learning capacity"];
    case "retirement_readiness":
      return ["Financial awareness", "Health consciousness", "Social connection"];
    case "senior_employment":
      return ["Experience leveraging", "Mentorship potential", "Work-life balance oriented"];
    default:
      return ["Analytical thinking", "Proactive approach", "Detail-oriented"];
  }
};

// For backwards compatibility 
export const performAIEnhancedAnalysis = generateAIEnhancedAnalysis;
export const getAIEnhancedAnalysis = generateAIEnhancedAnalysis;
