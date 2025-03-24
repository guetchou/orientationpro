
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { MultipleIntelligenceResults } from "@/types/test";
import axios from "axios";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import { Loader2 } from "lucide-react";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function MultipleIntelligenceTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const intelligenceQuestions = [
    {
      id: 1,
      question: "Comment préférez-vous apprendre de nouvelles choses ?",
      options: [
        "En lisant et en écrivant",
        "En écoutant des explications",
        "En manipulant des objets",
        "En observant des schémas et des images"
      ]
    },
    {
      id: 2,
      question: "Quelle activité vous attire le plus ?",
      options: [
        "Résoudre des énigmes mathématiques",
        "Jouer d'un instrument de musique",
        "Faire du sport",
        "Dessiner ou peindre"
      ]
    },
    {
      id: 3,
      question: "Comment organisez-vous vos idées ?",
      options: [
        "En faisant des listes",
        "En créant des cartes mentales",
        "En discutant avec d'autres",
        "En faisant des croquis"
      ]
    }
  ];

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < intelligenceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsSubmitting(true);
      try {
        // Analyser les résultats
        const results: MultipleIntelligenceResults = analyzeMultipleIntelligence(newAnswers);
        
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('multiple_intelligence', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans le backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'multiple_intelligence',
            results: {
              ...results,
              aiInsights
            },
            answers: newAnswers,
            confidence_score: results.confidenceScore || 80
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
            testType: 'multiple_intelligence'
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

  const analyzeMultipleIntelligence = (responses: string[]): MultipleIntelligenceResults => {
    // Initialiser tous les scores à un niveau de base
    let linguistic = 30;
    let logical = 30;
    let spatial = 30;
    let musical = 30;
    let bodily = 30;
    let interpersonal = 30;
    let intrapersonal = 30;
    let naturalist = 30;

    // Analyser les réponses pour ajuster les scores
    responses.forEach((response, index) => {
      if (index === 0) {
        // Question 1: Comment préférez-vous apprendre ?
        if (response.includes("lisant")) linguistic += 20;
        else if (response.includes("écoutant")) musical += 20;
        else if (response.includes("manipulant")) bodily += 20;
        else if (response.includes("observant")) spatial += 20;
      } else if (index === 1) {
        // Question 2: Quelle activité vous attire ?
        if (response.includes("énigmes")) logical += 20;
        else if (response.includes("instrument")) musical += 20;
        else if (response.includes("sport")) bodily += 20;
        else if (response.includes("dessiner")) spatial += 20;
      } else if (index === 2) {
        // Question 3: Organisation des idées
        if (response.includes("listes")) logical += 20;
        else if (response.includes("cartes mentales")) intrapersonal += 20;
        else if (response.includes("discutant")) interpersonal += 20;
        else if (response.includes("croquis")) spatial += 20;
      }
    });

    // Trouver les intelligences dominantes
    const intelligences = [
      { name: "Linguistique", score: linguistic },
      { name: "Logico-mathématique", score: logical },
      { name: "Spatiale", score: spatial },
      { name: "Musicale", score: musical },
      { name: "Corporelle-kinesthésique", score: bodily },
      { name: "Interpersonnelle", score: interpersonal },
      { name: "Intrapersonnelle", score: intrapersonal },
      { name: "Naturaliste", score: naturalist }
    ];
    
    intelligences.sort((a, b) => b.score - a.score);
    const dominantIntelligences = intelligences.slice(0, 3).map(i => i.name);

    return {
      linguistic,
      logical,
      spatial,
      musical,
      bodily,
      interpersonal,
      intrapersonal,
      naturalist,
      dominantIntelligences,
      confidenceScore: 80
    };
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-900 dark:to-purple-900 py-12 px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6">
          <TestBreadcrumb testName="Test des Intelligences Multiples" color="purple" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-purple-800 dark:text-purple-300">Test des Intelligences Multiples</h1>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-violet-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestion + 1} sur {intelligenceQuestions.length}
              </h2>
              <p className="text-lg mb-4">{intelligenceQuestions[currentQuestion].question}</p>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 mb-6">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${((currentQuestion + 1) / intelligenceQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {intelligenceQuestions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-300 transition-all duration-200"
                >
                  {option}
                </Button>
              ))}
            </div>

            {isSubmitting && (
              <div className="flex justify-center mt-6">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600 dark:text-purple-400" />
                <span className="ml-2 text-purple-600 dark:text-purple-400">Analyse en cours...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
