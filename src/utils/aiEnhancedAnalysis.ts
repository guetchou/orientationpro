
import { TestResult, AIEnhancedAnalysis } from '@/types/test';
import { supabase } from '@/lib/supabaseClient';

/**
 * Fetch AI enhanced analysis for a test result
 * @param testResult The test result to analyze
 * @returns Promise with AI enhanced analysis
 */
export async function performAIEnhancedAnalysis(testResult: TestResult): Promise<AIEnhancedAnalysis> {
  try {
    // Call the AI analysis endpoint through Supabase Edge Functions
    const { data, error } = await supabase.functions.invoke('analyze-test-results', {
      body: { 
        testResult: {
          id: testResult.id,
          created_at: testResult.created_at,
          user_id: testResult.user_id,
          test_type: testResult.test_type,
          results: testResult.results, 
          // For backward compatibility
          result_data: testResult.results || testResult.result_data,
          score: testResult.score
        }
      }
    });

    if (error) {
      console.error('Error calling AI analysis:', error);
      return createErrorAnalysis(`Failed to analyze test: ${error.message}`);
    }

    return data.analysis || createGenericAnalysis(testResult.test_type);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return createErrorAnalysis('An unexpected error occurred during analysis');
  }
}

// For compatibility with existing code
export async function getAIEnhancedAnalysis(testType: string, results: any): Promise<AIEnhancedAnalysis> {
  try {
    // Create a mock test result to pass to the analysis function
    const mockTestResult: TestResult = {
      id: 'temp-' + Date.now(),
      created_at: new Date().toISOString(),
      user_id: 'temp-user',
      test_type: testType,
      results: results || {}
    };

    return await performAIEnhancedAnalysis(mockTestResult);
  } catch (error) {
    console.error('Error in getAIEnhancedAnalysis:', error);
    return createErrorAnalysis('Failed to generate analysis');
  }
}

// Helper function to create an error analysis
function createErrorAnalysis(errorMessage: string): AIEnhancedAnalysis {
  return {
    testType: "unknown",
    dominantTraits: [],
    traitCombinations: [],
    strengths: [],
    weaknesses: [],
    recommendations: [],
    error: errorMessage
  };
}

// Helper function to create a generic analysis
function createGenericAnalysis(testType: string): AIEnhancedAnalysis {
  return {
    testType: testType || "general",
    dominantTraits: ["Analytical thinking", "Problem solving", "Adaptability"],
    traitCombinations: ["Analysis + Creativity", "Adaptability + Resilience"],
    strengths: [
      "Capacity to analyze complex situations",
      "Determination to achieve goals",
      "Flexibility in the face of change"
    ],
    weaknesses: [
      "Could improve balance between reflection and action",
      "Occasional tendency to over-analyze"
    ],
    recommendations: [
      "Use analytical strengths in decision making",
      "Balance reflection with concrete action",
      "Leverage adaptability as a competitive advantage"
    ]
  };
}
