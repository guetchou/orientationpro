
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

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
      
      if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        navigate('/login', { state: { redirectAfterLogin: '/tests' } });
        return;
      }
      
      // Save results
      const response = await axios.post(`${backendUrl}/api/test-results`, {
        user_id: user.id,
        test_type: testType,
        results: {
          ...results,
          aiInsights
        },
        answers: finalAnswers,
        confidence_score: results.confidenceScore || 85
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data?.id) {
        setIsCompleted(true);
        toast.success("Test complété avec succès !");
        
        // Navigate to results with the test ID
        navigate(`/test-results?testId=${response.data.id}`);
      } else {
        throw new Error("La réponse du serveur ne contient pas l'ID du test");
      }
    } catch (error: any) {
      console.error('Error completing test:', error);
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde des résultats");
      
      // Even if there's an error saving, navigate to dashboard to show partial results
      navigate('/dashboard', { 
        state: { 
          results: analyzeResults(finalAnswers), 
          testType,
          saveError: true
        } 
      });
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
