
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import { Loader2 } from "lucide-react";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";
import { emotionalQuestions } from "@/components/tests/emotional/EmotionalQuestions";
import { analyzeEmotionalResults } from "@/components/tests/emotional/EmotionalTestAnalyzer";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function EmotionalTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < emotionalQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsSubmitting(true);
      
      try {
        // Analyser les résultats
        const results = analyzeEmotionalResults(newAnswers);
        
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('emotional', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans votre backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'emotional',
            results: {
              ...results,
              aiInsights
            },
            answers: newAnswers,
            confidence_score: results.confidenceScore || 85
          }, {
            withCredentials: true
          });
          
          toast.success("Test complété avec succès !");
        } else {
          toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        }
        
        navigate('/dashboard/results', { 
          state: { 
            results: {
              ...results,
              aiInsights
            }, 
            testType: 'emotional' 
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

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-900 dark:to-pink-900 py-12 px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6">
          <TestBreadcrumb testName="Test d'Intelligence Émotionnelle" color="pink" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-pink-800 dark:text-pink-300">Test d'Intelligence Émotionnelle</h1>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-rose-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestion + 1} sur {emotionalQuestions.length}
              </h2>
              <p className="text-lg mb-4">{emotionalQuestions[currentQuestion].question}</p>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 mb-6">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${((currentQuestion + 1) / emotionalQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {emotionalQuestions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-pink-50 hover:text-pink-700 dark:hover:bg-pink-900/30 dark:hover:text-pink-300 transition-all duration-200"
                >
                  {option.text}
                </Button>
              ))}
            </div>

            {isSubmitting && (
              <div className="flex justify-center mt-6">
                <Loader2 className="h-6 w-6 animate-spin text-pink-600 dark:text-pink-400" />
                <span className="ml-2 text-pink-600 dark:text-pink-400">Analyse en cours...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
