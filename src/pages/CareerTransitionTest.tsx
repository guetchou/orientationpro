
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { CareerTransitionResults } from "@/types/test";
import axios from "axios";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function CareerTransitionTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const careerTransitionQuestions = [
    {
      id: 1,
      question: "Quel est votre niveau de satisfaction dans votre carrière actuelle ?",
      options: [
        { text: "Très insatisfait(e)", value: 10 },
        { text: "Plutôt insatisfait(e)", value: 30 },
        { text: "Neutre", value: 50 },
        { text: "Plutôt satisfait(e)", value: 70 },
        { text: "Très satisfait(e)", value: 90 }
      ]
    },
    {
      id: 2,
      question: "Comment évaluez-vous la transférabilité de vos compétences actuelles vers un nouveau domaine ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Bonne", value: 70 },
        { text: "Excellente", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Quel est votre niveau d'adaptabilité au changement ?",
      options: [
        { text: "Je résiste fortement au changement", value: 10 },
        { text: "Je préfère la stabilité", value: 30 },
        { text: "Je m'adapte progressivement", value: 50 },
        { text: "Je m'adapte bien aux changements", value: 70 },
        { text: "J'accueille positivement les changements", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Quelle est votre tolérance au risque professionnel ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Élevée", value: 70 },
        { text: "Très élevée", value: 90 }
      ]
    },
    {
      id: 5,
      question: "Comment évaluez-vous votre capacité à apprendre de nouvelles compétences ?",
      options: [
        { text: "Très limitée", value: 10 },
        { text: "Limitée", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Bonne", value: 70 },
        { text: "Excellente", value: 90 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < careerTransitionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: CareerTransitionResults = analyzeCareerTransitionResults(newAnswers);
      
      try {
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('career_transition', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans le backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'career_transition',
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
            testType: 'career_transition'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  // Analyse des résultats de reconversion professionnelle
  const analyzeCareerTransitionResults = (responses: number[]): CareerTransitionResults => {
    // Calcul des scores pour chaque dimension
    const currentSatisfaction = responses[0] || 50;
    const skillTransferability = responses[1] || 50;
    const adaptability = responses[2] || 50;
    const riskTolerance = responses[3] || 50;
    const learningCapacity = responses[4] || 50;

    // Calcul du score de préparation à la transition
    const transitionReadiness = Math.round(
      (currentSatisfaction * 0.1) + // moins on est satisfait, plus on est prêt à changer
      (skillTransferability * 0.25) +
      (adaptability * 0.25) +
      (riskTolerance * 0.2) +
      (learningCapacity * 0.2)
    );

    // Recommandations de secteurs basées sur les réponses
    const recommendedSectors = [];
    if (skillTransferability > 70 && learningCapacity > 70) {
      recommendedSectors.push("Technologie", "Conseil", "Formation");
    } else if (adaptability > 70 && riskTolerance > 70) {
      recommendedSectors.push("Entrepreneuriat", "Vente", "Marketing");
    } else if (currentSatisfaction < 30) {
      recommendedSectors.push("Services sociaux", "Éducation", "Environnement");
    } else {
      recommendedSectors.push("Gestion de projet", "Ressources humaines", "Administration");
    }

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 85; // valeur par défaut, à affiner si nécessaire

    return {
      currentSatisfaction,
      skillTransferability,
      adaptability,
      riskTolerance,
      learningCapacity,
      recommendedSectors,
      transitionReadiness,
      confidenceScore
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test de Reconversion Professionnelle</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {careerTransitionQuestions.length}
            </h2>
            <p className="text-lg mb-4">{careerTransitionQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / careerTransitionQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {careerTransitionQuestions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option.value)}
                variant="outline"
                className="w-full text-left justify-start h-auto py-4 px-6"
              >
                {option.text}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
