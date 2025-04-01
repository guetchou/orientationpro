
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { SeniorEmploymentResults } from "@/types/test";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import { Loader2 } from "lucide-react";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function SeniorEmploymentTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const seniorEmploymentQuestions = [
    {
      id: 1,
      question: "Comment évaluez-vous la valeur de votre expérience professionnelle ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Bonne", value: 70 },
        { text: "Excellente", value: 90 }
      ]
    },
    {
      id: 2,
      question: "Comment vous adaptez-vous aux nouvelles technologies ?",
      options: [
        { text: "Très difficilement", value: 10 },
        { text: "Difficilement", value: 30 },
        { text: "Moyennement", value: 50 },
        { text: "Bien", value: 70 },
        { text: "Très bien", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Quelle importance accordez-vous à l'équilibre vie privée-vie professionnelle ?",
      options: [
        { text: "Aucune importance", value: 10 },
        { text: "Peu d'importance", value: 30 },
        { text: "Importance moyenne", value: 50 },
        { text: "Importance", value: 70 },
        { text: "Très grande importance", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Quel est votre potentiel de mentorat pour les jeunes générations ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyen", value: 50 },
        { text: "Bon", value: 70 },
        { text: "Excellent", value: 90 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < seniorEmploymentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsSubmitting(true);
      try {
        // Analyser les résultats
        const results: SeniorEmploymentResults = analyzeSeniorEmploymentResults(newAnswers);
        
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('senior_employment', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans le backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'senior_employment',
            results: {
              ...results,
              aiInsights
            },
            answers: newAnswers,
            confidence_score: results.confidenceScore || 75
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
            testType: 'senior_employment'
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

  // Analyse des résultats d'emploi senior
  const analyzeSeniorEmploymentResults = (responses: number[]): SeniorEmploymentResults => {
    // Calcul des scores pour chaque dimension
    const experienceValue = responses[0] || 50;
    const technologyAdaptation = responses[1] || 50;
    const workLifeBalance = responses[2] || 50;
    const mentorshipPotential = responses[3] || 50;

    // Recommandations de rôles basées sur les réponses
    const recommendedRoles = [];
    if (experienceValue > 70 && mentorshipPotential > 70) {
      recommendedRoles.push("Consultant", "Mentor", "Formateur");
    } else if (technologyAdaptation > 70) {
      recommendedRoles.push("Conseiller technique", "Spécialiste IT", "Support technique");
    } else {
      recommendedRoles.push("Gestion de projet", "Administration", "Service à la clientèle");
    }

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 85; // valeur par défaut, à affiner si nécessaire

    return {
      experienceValue,
      technologyAdaptation,
      workLifeBalance,
      mentorshipPotential,
      recommendedRoles,
      confidenceScore
    };
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-amber-900 py-12 px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6">
          <TestBreadcrumb testName="Test d'Emploi Senior" color="amber" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-amber-800 dark:text-amber-300">Test d'Emploi Senior</h1>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-orange-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestion + 1} sur {seniorEmploymentQuestions.length}
              </h2>
              <p className="text-lg mb-4">{seniorEmploymentQuestions[currentQuestion].question}</p>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 mb-6">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${((currentQuestion + 1) / seniorEmploymentQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {seniorEmploymentQuestions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-300 transition-all duration-200"
                >
                  {option.text}
                </Button>
              ))}
            </div>

            {isSubmitting && (
              <div className="flex justify-center mt-6">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600 dark:text-amber-400" />
                <span className="ml-2 text-amber-600 dark:text-amber-400">Analyse en cours...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
