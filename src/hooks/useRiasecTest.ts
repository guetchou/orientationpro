
import { useState } from "react";
import { RiasecResults } from "@/types/test";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useRiasecTest = () => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RiasecResults | null>(null);
  const navigate = useNavigate();

  // Reset the test if the user goes back to the start
  const resetTest = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
  };

  // Start the test
  const startTest = () => {
    setStarted(true);
  };

  // Handle the user's answer
  const handleAnswer = async (score: number, questions: any[]) => {
    setLoading(true);
    // Add the answer to the array
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    
    // Move to the next question or complete the test
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setLoading(false);
    } else {
      // Test completed, calculate the results
      await completeTest(newAnswers, questions);
    }
  };

  // Navigate to the previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Remove the last answer
      setAnswers(answers.slice(0, -1));
    }
  };

  // Calculate the RIASEC results
  const completeTest = async (finalAnswers: number[], questions: any[]) => {
    // Calculate the scores for each category
    let realistic = 0;
    let investigative = 0;
    let artistic = 0;
    let social = 0;
    let enterprising = 0;
    let conventional = 0;

    // Map each answer to its category
    finalAnswers.forEach((answer, index) => {
      const category = questions[index].category;
      switch (category) {
        case "realistic":
          realistic += answer;
          break;
        case "investigative":
          investigative += answer;
          break;
        case "artistic":
          artistic += answer;
          break;
        case "social":
          social += answer;
          break;
        case "enterprising":
          enterprising += answer;
          break;
        case "conventional":
          conventional += answer;
          break;
      }
    });

    // Normalize the scores to be out of 100
    const maxPossibleScore = 5 * (questions.filter(q => q.category === "realistic").length);
    realistic = Math.round((realistic / maxPossibleScore) * 100);
    investigative = Math.round((investigative / maxPossibleScore) * 100);
    artistic = Math.round((artistic / maxPossibleScore) * 100);
    social = Math.round((social / maxPossibleScore) * 100);
    enterprising = Math.round((enterprising / maxPossibleScore) * 100);
    conventional = Math.round((conventional / maxPossibleScore) * 100);

    // Calculate the personality code (top 3 scores)
    const scores = [
      { code: "R", score: realistic },
      { code: "I", score: investigative },
      { code: "A", score: artistic },
      { code: "S", score: social },
      { code: "E", score: enterprising },
      { code: "C", score: conventional }
    ];
    scores.sort((a, b) => b.score - a.score);
    const personalityCode = `${scores[0].code}${scores[1].code}${scores[2].code}`;
    const dominantTypes = scores.slice(0, 3).map(item => item.code);

    // Create the results object
    const testResults: RiasecResults = {
      realistic,
      investigative,
      artistic,
      social,
      enterprising,
      conventional,
      personalityCode,
      confidenceScore: 90,
      dominantTypes
    };

    // Set the results
    setResults(testResults);
    
    try {
      // Get AI enhanced analysis
      const aiInsights = await getAIEnhancedAnalysis('riasec', testResults);
      
      // Check if user is logged in before saving
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.id) {
        // Save results to database if user is logged in
        const { error } = await supabase.from('test_results').insert({
          user_id: user.id,
          test_type: 'riasec',
          result_data: {
            ...testResults,
            aiInsights
          }
        });
        
        if (error) {
          console.error('Error saving results:', error);
          toast.error("Impossible d'enregistrer vos résultats.");
        } else {
          toast.success("Test complété avec succès !");
        }
      }
      
      // Mark test as completed and stop loading
      setCompleted(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Error finalizing test:', error);
      toast.error("Une erreur s'est produite lors de l'analyse de vos résultats.");
      setLoading(false);
    }
  };

  // View the test results
  const viewResults = () => {
    if (results) {
      navigate('/test-results', { 
        state: { 
          results,
          testType: 'riasec'
        }
      });
    }
  };

  return {
    started,
    completed,
    currentQuestion,
    answers,
    loading,
    results,
    resetTest,
    startTest,
    handleAnswer,
    handlePrevious,
    viewResults
  };
};
