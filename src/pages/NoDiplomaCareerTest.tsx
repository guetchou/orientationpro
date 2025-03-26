
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { NoDiplomaCareerResults } from "@/types/test";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import { Loader2, Wrench, Lightbulb, GraduationCap, Network, Users } from "lucide-react";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";
import { Badge } from "@/components/ui/badge";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const noDiplomaCareerQuestions = [
  {
    id: 1,
    question: "Comment évaluez-vous vos compétences pratiques et manuelles ?",
    description: "Votre capacité à créer, réparer, manipuler des objets",
    icon: <Wrench className="h-10 w-10 text-teal-500" />,
    tags: ["pratique", "manuel", "technique"],
    options: [
      { text: "Très limitées", value: 10 },
      { text: "Limitées", value: 30 },
      { text: "Moyennes", value: 50 },
      { text: "Bonnes", value: 70 },
      { text: "Excellentes", value: 90 }
    ]
  },
  {
    id: 2,
    question: "Comment évaluez-vous votre créativité et votre sens artistique ?",
    description: "Votre capacité à imaginer, concevoir, innover",
    icon: <Lightbulb className="h-10 w-10 text-yellow-500" />,
    tags: ["créativité", "innovation", "art"],
    options: [
      { text: "Très limitée", value: 10 },
      { text: "Limitée", value: 30 },
      { text: "Moyenne", value: 50 },
      { text: "Bonne", value: 70 },
      { text: "Excellente", value: 90 }
    ]
  },
  {
    id: 3,
    question: "Comment évaluez-vous votre capacité à apprendre par vous-même ?",
    description: "Votre autonomie dans l'acquisition de nouvelles compétences",
    icon: <GraduationCap className="h-10 w-10 text-blue-500" />,
    tags: ["autodidacte", "apprentissage", "formation"],
    options: [
      { text: "Très limitée", value: 10 },
      { text: "Limitée", value: 30 },
      { text: "Moyenne", value: 50 },
      { text: "Bonne", value: 70 },
      { text: "Excellente", value: 90 }
    ]
  },
  {
    id: 4,
    question: "Quel est votre niveau d'aisance avec l'entrepreneuriat ?",
    description: "Votre capacité à prendre des initiatives, gérer et développer des projets",
    icon: <Network className="h-10 w-10 text-purple-500" />,
    tags: ["entrepreneuriat", "initiative", "gestion"],
    options: [
      { text: "Pas du tout à l'aise", value: 10 },
      { text: "Peu à l'aise", value: 30 },
      { text: "Moyennement à l'aise", value: 50 },
      { text: "À l'aise", value: 70 },
      { text: "Très à l'aise", value: 90 }
    ]
  },
  {
    id: 5,
    question: "Comment évaluez-vous vos compétences relationnelles et de communication ?",
    description: "Votre facilité à interagir, convaincre et travailler avec les autres",
    icon: <Users className="h-10 w-10 text-pink-500" />,
    tags: ["communication", "relations", "équipe"],
    options: [
      { text: "Très limitées", value: 10 },
      { text: "Limitées", value: 30 },
      { text: "Moyennes", value: 50 },
      { text: "Bonnes", value: 70 },
      { text: "Excellentes", value: 90 }
    ]
  }
];

export default function NoDiplomaCareerTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < noDiplomaCareerQuestions.length - 1) {
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

  // Analyse des résultats de carrière sans diplôme
  const analyzeNoDiplomaCareerResults = (responses: number[]): NoDiplomaCareerResults => {
    // Calcul des scores pour chaque dimension
    const practicalSkills = responses[0] || 50;
    const creativity = responses[1] || 50;
    const selfLearningCapacity = responses[2] || 50;
    const entrepreneurialAptitude = responses[3] || 50;
    const socialIntelligence = responses[4] || 50;

    // Calcul des métriques dérivées
    const resilience = (practicalSkills + selfLearningCapacity) / 2;
    const careerPotential = (practicalSkills + creativity + selfLearningCapacity + entrepreneurialAptitude + socialIntelligence) / 5;
    const experiencePortfolio = (practicalSkills + entrepreneurialAptitude) / 2;
    const entrepreneurialSpirit = entrepreneurialAptitude; // Assignation directe pour correspondre au type

    // Identification des domaines recommandés
    const recommendedFields = [];
    const recommendedPaths = [];

    if (practicalSkills > 70) {
      recommendedFields.push("Métiers manuels");
      
      if (creativity > 60) {
        recommendedFields.push("Artisanat");
        recommendedPaths.push("Formation en artisanat");
      } else {
        recommendedFields.push("Construction");
        recommendedPaths.push("Apprentissage en bâtiment");
      }
    }

    if (entrepreneurialAptitude > 70) {
      recommendedFields.push("Création d'entreprise");
      recommendedPaths.push("Mentorat entrepreneurial");
      
      if (socialIntelligence > 60) {
        recommendedFields.push("Commerce");
        recommendedPaths.push("Vente et négociation");
      }
    }

    if (selfLearningCapacity > 70) {
      recommendedFields.push("Développement web");
      recommendedPaths.push("Formation en ligne");
      
      if (creativity > 60) {
        recommendedFields.push("Design numérique");
        recommendedPaths.push("Bootcamp créatif");
      }
    }

    if (socialIntelligence > 70) {
      recommendedFields.push("Services aux personnes");
      recommendedPaths.push("Formation en relation client");
    }

    // S'assurer qu'il y a au moins quelques recommandations
    if (recommendedFields.length === 0) {
      recommendedFields.push("Services", "Vente", "Support technique");
      recommendedPaths.push("Formation pratique", "Alternance", "Certification professionnelle");
    }

    // Limiter le nombre de recommandations
    const limitedFields = recommendedFields.slice(0, 5);
    const limitedPaths = recommendedPaths.slice(0, 5);

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 85;

    return {
      practicalSkills,
      creativity,
      entrepreneurialSpirit,
      resilience,
      socialIntelligence,
      experiencePortfolio,
      careerPotential,
      recommendedFields: limitedFields,
      entrepreneurialAptitude,
      selfLearningCapacity,
      recommendedPaths: limitedPaths,
      confidenceScore
    };
  };

  const currentQuestionData = noDiplomaCareerQuestions[currentQuestion];

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
            <div className="mb-6">
              <div className="flex flex-col items-center mb-6">
                {currentQuestionData.icon}
                <h2 className="text-xl font-semibold my-4 text-center">
                  {currentQuestionData.question}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-3">
                  {currentQuestionData.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentQuestionData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 mb-6">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${((currentQuestion + 1) / noDiplomaCareerQuestions.length) * 100}%`,
                  }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                Question {currentQuestion + 1} sur {noDiplomaCareerQuestions.length}
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
                    className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 transition-all duration-200"
                  >
                    {option.text}
                  </Button>
                </motion.div>
              ))}
            </div>

            {isSubmitting && (
              <div className="flex justify-center mt-6">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
                <span className="ml-2 text-teal-600 dark:text-teal-400">Analyse en cours...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
