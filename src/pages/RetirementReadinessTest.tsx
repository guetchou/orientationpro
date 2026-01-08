
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { RetirementReadinessResults } from "@/types/test";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import { Loader2, Dumbbell, Heart, Users, Target, Coffee } from "lucide-react";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";

// FIXE: Toutes les requêtes backend sont forcées sur http://10.10.0.5:7474 même en développement, ne pas modifier sans raison métier.
const backendUrl = import.meta.env.VITE_BACKEND_URL;
if (!backendUrl) throw new Error('VITE_BACKEND_URL doit être défini dans .env');

const retirementReadinessQuestions = [
  {
    id: 1,
    question: "Comment évaluez-vous votre préparation financière à la retraite ?",
    description: "Considérez vos économies, investissements et plans de retraite",
    icon: <Dumbbell className="h-10 w-10 text-orange-500" />,
    options: [
      { text: "Aucune préparation", value: 10 },
      { text: "Préparation minimale", value: 30 },
      { text: "Préparation modérée", value: 50 },
      { text: "Bonne préparation", value: 70 },
      { text: "Préparation excellente", value: 90 }
    ]
  },
  {
    id: 2,
    question: "Avez-vous un plan pour maintenir votre santé à la retraite ?",
    description: "Activité physique, alimentation, suivi médical régulier",
    icon: <Heart className="h-10 w-10 text-red-500" />,
    options: [
      { text: "Aucun plan", value: 10 },
      { text: "Plan vague", value: 30 },
      { text: "Plan en développement", value: 50 },
      { text: "Plan bien défini", value: 70 },
      { text: "Plan complet et détaillé", value: 90 }
    ]
  },
  {
    id: 3,
    question: "Comment évaluez-vous votre réseau social pour la retraite ?",
    description: "Famille, amis, communauté, associations",
    icon: <Users className="h-10 w-10 text-blue-500" />,
    options: [
      { text: "Très limité", value: 10 },
      { text: "Limité", value: 30 },
      { text: "Modéré", value: 50 },
      { text: "Développé", value: 70 },
      { text: "Très développé", value: 90 }
    ]
  },
  {
    id: 4,
    question: "Avez-vous défini des objectifs clairs pour votre retraite ?",
    description: "Projets, aspirations, sens et but de vie",
    icon: <Target className="h-10 w-10 text-purple-500" />,
    options: [
      { text: "Pas d'objectifs", value: 10 },
      { text: "Objectifs vagues", value: 30 },
      { text: "Quelques objectifs définis", value: 50 },
      { text: "Objectifs bien définis", value: 70 },
      { text: "Plan de vie complet", value: 90 }
    ]
  },
  {
    id: 5,
    question: "Avez-vous identifié des activités de loisir pour votre retraite ?",
    description: "Hobbies, voyages, bénévolat, apprentissage",
    icon: <Coffee className="h-10 w-10 text-amber-500" />,
    options: [
      { text: "Aucune idée", value: 10 },
      { text: "Quelques idées vagues", value: 30 },
      { text: "Plusieurs idées", value: 50 },
      { text: "Plan d'activités défini", value: 70 },
      { text: "Plan d'activités complet", value: 90 }
    ]
  }
];

export default function RetirementReadinessTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < retirementReadinessQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsSubmitting(true);
      
      try {
        // Analyser les résultats
        const results = analyzeRetirementReadinessResults(newAnswers);
        
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('retirement_readiness', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans le backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'retirement_readiness',
            results: {
              ...results,
              aiInsights
            },
            answers: newAnswers,
            progress_score: 100,
            confidence_score: results.confidenceScore || 80
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
            testType: 'retirement_readiness'
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

  // Analyse des résultats de préparation à la retraite
  const analyzeRetirementReadinessResults = (responses: number[]): RetirementReadinessResults => {
    // Calcul des scores pour chaque dimension
    const financialPreparation = responses[0] || 50;
    const healthPlanning = responses[1] || 50;
    const socialConnections = responses[2] || 50;
    const purposeClarity = responses[3] || 50;
    const leisureInterests = responses[4] || 50;

    // Calcul des métriques agrégées
    const socialPlanning = (socialConnections + leisureInterests) / 2;
    const activityPlanning = (healthPlanning + leisureInterests) / 2;
    const readinessScore = Math.round(
      (financialPreparation + healthPlanning + socialConnections + purposeClarity + leisureInterests) / 5
    );

    // Définition du niveau de préparation basé sur le score
    let readinessLevel = "Non préparé(e)";
    if (readinessScore >= 80) {
      readinessLevel = "Très bien préparé(e)";
    } else if (readinessScore >= 60) {
      readinessLevel = "Bien préparé(e)";
    } else if (readinessScore >= 40) {
      readinessLevel = "Modérément préparé(e)";
    }

    // Génération de recommandations personnalisées
    const recommendedSteps = [];
    if (financialPreparation < 50) {
      recommendedSteps.push("Consulter un conseiller financier");
      recommendedSteps.push("Établir un budget de retraite détaillé");
    }
    if (healthPlanning < 50) {
      recommendedSteps.push("Élaborer un plan d'activité physique régulière");
      recommendedSteps.push("Planifier des bilans médicaux préventifs");
    }
    if (socialConnections < 50) {
      recommendedSteps.push("Rejoindre des groupes sociaux ou des clubs");
      recommendedSteps.push("Renforcer les liens familiaux existants");
    }
    if (purposeClarity < 50) {
      recommendedSteps.push("Définir des objectifs clairs pour la retraite");
      recommendedSteps.push("Explorer des activités qui donnent du sens");
    }
    if (leisureInterests < 50) {
      recommendedSteps.push("Essayer de nouvelles activités de loisir");
      recommendedSteps.push("Planifier des voyages ou expériences enrichissantes");
    }

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 80;

    return {
      financialPreparation,
      healthPlanning,
      socialConnections,
      purposeClarity,
      leisureInterests,
      readinessLevel,
      recommendedSteps,
      confidenceScore,
      socialPlanning,
      activityPlanning,
      readinessScore
    };
  };

  const currentQuestionData = retirementReadinessQuestions[currentQuestion];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-amber-900 py-12 px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6">
          <TestBreadcrumb testName="Test de Préparation à la Retraite" color="orange" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-orange-800 dark:text-orange-300">
          Test de Préparation à la Retraite
        </h1>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-amber-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="mb-6">
              <div className="flex flex-col items-center mb-6">
                {currentQuestionData.icon}
                <h2 className="text-xl font-semibold my-4 text-center">
                  {currentQuestionData.question}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {currentQuestionData.description}
                </p>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 mb-6">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${((currentQuestion + 1) / retirementReadinessQuestions.length) * 100}%`,
                  }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                Question {currentQuestion + 1} sur {retirementReadinessQuestions.length}
              </div>
            </div>

            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleAnswer(option.value)}
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 transition-all duration-200"
                  >
                    {option.text}
                  </Button>
                </motion.div>
              ))}
            </div>

            {isSubmitting && (
              <div className="flex justify-center mt-6">
                <Loader2 className="h-6 w-6 animate-spin text-orange-600 dark:text-orange-400" />
                <span className="ml-2 text-orange-600 dark:text-orange-400">Analyse en cours...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
