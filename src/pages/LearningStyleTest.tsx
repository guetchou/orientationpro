
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { LearningStyleResults } from "@/types/test";
import axios from "axios";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import { Loader2 } from "lucide-react";
import { learningStyleQuestions } from "@/components/tests/learning/LearningStyleQuestions";
import { analyzeLearningStyleResults } from "@/components/tests/learning/LearningStyleAnalyzer";
import LearningStyleQuestion from "@/components/tests/learning/LearningStyleQuestion";
import TestProgressTracker from "@/components/tests/TestProgressTracker";
import TestFAQ from "@/components/tests/TestFAQ";
import { learningStyleFAQs } from "@/components/tests/learning/LearningStyleFAQ";
import TestCompleteNotification from "@/components/tests/TestCompleteNotification";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function LearningStyleTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < learningStyleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsSubmitting(true);
      try {
        // Analyser les résultats
        const results: LearningStyleResults = analyzeLearningStyleResults(newAnswers);
        
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('learning_style', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans le backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'learning_style',
            results: {
              ...results,
              aiInsights
            },
            answers: newAnswers,
            confidence_score: results.confidenceScore || 75
          }, {
            withCredentials: true
          });
          setIsCompleted(true);
          toast.success("Test complété avec succès !");
        } else {
          toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        }
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const viewResults = () => {
    navigate('/dashboard/results', { 
      state: { 
        results: {
          ...analyzeLearningStyleResults(answers),
          aiInsights: null // This will be filled by the backend
        }, 
        testType: 'learning_style'
      } 
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-900 py-12 px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6">
          <TestBreadcrumb testName="Test de Styles d'Apprentissage" color="green" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-green-800 dark:text-green-300">Test de Styles d'Apprentissage</h1>
        
        {isCompleted ? (
          <TestCompleteNotification 
            testName="Styles d'Apprentissage" 
            onClick={viewResults} 
          />
        ) : (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-emerald-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="mb-6">
                <TestProgressTracker 
                  currentStep={currentQuestion + 1} 
                  totalSteps={learningStyleQuestions.length} 
                  testName="Styles d'Apprentissage"
                  color="green"
                />
                
                <h2 className="text-xl font-semibold mb-4">
                  Question {currentQuestion + 1} sur {learningStyleQuestions.length}
                </h2>
              </div>

              <LearningStyleQuestion 
                question={learningStyleQuestions[currentQuestion].question}
                options={learningStyleQuestions[currentQuestion].options}
                onAnswer={handleAnswer}
                isSubmitting={isSubmitting}
              />

              {isSubmitting && (
                <div className="flex justify-center mt-6">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600 dark:text-green-400" />
                  <span className="ml-2 text-green-600 dark:text-green-400">Analyse en cours...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <TestFAQ testType="de Styles d'Apprentissage" faqs={learningStyleFAQs} />
      </div>
    </motion.div>
  );
}
