
import { calculateDominantTraits } from "../analysisAlgorithms";
import { TestResult } from "@/types/test";

export const analyzeTestResults = (results: TestResult) => {
  try {
    // Extract scores from results
    const scores = results.scores || {};
    
    // Calculate dominant traits based on scores
    const dominantTraits = calculateDominantTraits(scores);
    
    // Determine strength of traits (high, medium, low)
    const traitStrengths = Object.entries(scores).reduce((acc, [trait, score]) => {
      let strength = "low";
      if (score > 75) strength = "high";
      else if (score > 50) strength = "medium";
      
      return { ...acc, [trait]: strength };
    }, {});
    
    // Create trait combinations for deeper insights
    const traitCombinations = dominantTraits.length >= 2 
      ? [dominantTraits.slice(0, 2).join("-")] 
      : [];
    
    return {
      dominantTraits,
      traitStrengths,
      traitCombinations,
      rawScores: scores,
      analysisVersion: "1.0",
      testType: results.testType || "unknown"
    };
  } catch (error) {
    console.error("Error analyzing test results:", error);
    return {
      error: "Failed to analyze results",
      analysisVersion: "1.0",
      testType: results?.testType || "unknown"
    };
  }
};
