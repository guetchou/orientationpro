
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import axios from "axios";

// Get backend URL from environment variables or use a default value
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface UseTestStateProps<T> {
  testType: string;
  questions: any[];
  analyzeResults: (answers: any[]) => T;
}

export function useTestState<T>({ testType, questions, analyzeResults }: UseTestStateProps<T>) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (answer: any) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await completeTest(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const completeTest = async (finalAnswers: any[]) => {
    setIsSubmitting(true);
    
    try {
      // Analyze test results
      const results = analyzeResults(finalAnswers);
      
      // Enhance results with AI analysis
      const aiInsights = await getAIEnhancedAnalysis(testType, results);
      
      // Get current user
      const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
        withCredentials: true
      });
      const user = userResponse.data;
      
      if (user?.id) {
        // Save results
        await axios.post(`${backendUrl}/api/test-results`, {
          user_id: user.id,
          test_type: testType,
          results: {
            ...results,
            aiInsights
          },
          answers: finalAnswers,
          progress_score: 100,
          // @ts-expect-error confidenceScore may not exist on all result types
          confidence_score: results.confidenceScore || 85
        }, {
          withCredentials: true
        });
        
        setIsCompleted(true);
        toast.success("Test complété avec succès !");
      } else {
        toast.error("Vous devez être connecté pour sauvegarder vos résultats");
      }
      
      // Navigate to results
      navigate('/dashboard/results', { 
        state: { 
          results: {
            ...results,
            aiInsights
          }, 
          testType 
        } 
      });
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error("Erreur lors de la sauvegarde des résultats");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setIsCompleted(false);
  };

  return {
    currentQuestion,
    totalQuestions: questions.length,
    currentQuestionData: questions[currentQuestion],
    answers,
    isSubmitting,
    isCompleted,
    handleAnswer,
    handlePrevious,
    resetTest
  };
}
