import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";
import { TestQuestion } from "@/components/tests/nodiploma/TestQuestion";
import { careerTestQuestions } from "@/components/tests/nodiploma/TestQuestions";
import { analyzeNoDiplomaCareerResults } from "@/components/tests/nodiploma/ResultsAnalyzer";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function NoDiplomaCareerTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < careerTestQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsSubmitting(true);
      
      try {
        // Analyser les résultats
        const results = analyzeNoDiplomaCareerResults(newAnswers);
        
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('no_diploma_career', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans le backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'no_diploma_career',
            results: {
              ...results,
              aiInsights
            },
            answers: newAnswers,
            progress_score: 100,
            confidence_score: results.confidenceScore || 85
          }, {
            withCredentials: true
          });
          toast.success("Test complété avec succès !");
        } else {
          toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        }
        
        // Rediriger vers la page des résultats
        navigate('/dashboard/results', { 
          state: { 
            results: {
              ...results,
              aiInsights
            }, 
            testType: 'no_diploma_career'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentQuestionData = careerTestQuestions[currentQuestion];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-900 dark:to-teal-900 py-12 px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6">
          <TestBreadcrumb testName="Test d'Orientation Sans Diplôme" color="teal" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-teal-800 dark:text-teal-300">
          Test d'Orientation Sans Diplôme
        </h1>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 via-transparent to-emerald-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
          <CardContent className="p-6 relative z-10">
            <TestQuestion
              currentQuestion={currentQuestionData}
              totalQuestions={careerTestQuestions.length}
              currentQuestionIndex={currentQuestion}
              onAnswer={handleAnswer}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
