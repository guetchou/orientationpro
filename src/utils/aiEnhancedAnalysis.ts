
import { analyzeTestResults } from "./analysis/analyzeTestResults";
import { generateSuggestions } from "./analysis/generateSuggestions";
import { TestResult } from "@/types/test";

export const performAIEnhancedAnalysis = async (results: TestResult) => {
  try {
    // Step 1: Analyze the raw test results
    const analysis = analyzeTestResults(results);
    
    // Step 2: Generate AI-powered suggestions based on the analysis
    const suggestions = await generateSuggestions(analysis);
    
    // Step 3: Combine the analysis and suggestions into a comprehensive report
    return {
      ...analysis,
      suggestions,
      enhancedByAI: true,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error performing AI-enhanced analysis:", error);
    return {
      error: "Failed to perform AI analysis",
      enhancedByAI: false,
      generatedAt: new Date().toISOString()
    };
  }
};
