import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { NoDiplomaCareerResults } from "@/types/test";
import axios from "axios";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function NoDiplomaCareerTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const noDiplomaCareerQuestions = [
    {
      id: 1,
      question: "Comment évaluez-vous vos compétences pratiques ?",
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
      question: "Quel est votre intérêt pour les métiers manuels ou techniques ?",
      options: [
        { text: "Aucun intérêt", value: 10 },
        { text: "Peu d'intérêt", value: 30 },
        { text: "Intérêt modéré", value: 50 },
        { text: "Intérêt certain", value: 70 },
        { text: "Passionné(e)", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Comment évaluez-vous votre capacité à apprendre par vous-même ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Bonne", value: 70 },
        { text: "Excellente", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Quel est votre intérêt pour l'entrepreneuriat ?",
      options: [
        { text: "Aucun intérêt", value: 10 },
        { text: "Peu d'intérêt", value: 30 },
        { text: "Intérêt modéré", value: 50 },
        { text: "Intérêt certain", value: 70 },
        { text: "Passionné(e)", value: 90 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < noDiplomaCareerQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: NoDiplomaCareerResults = analyzeNoDiplomaCareerResults(newAnswers);
      
      try {
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
            testType: 'no_diploma_career'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  // Analyse des résultats de carrière sans diplôme
  const analyzeNoDiplomaCareerResults = (responses: number[]): NoDiplomaCareerResults => {
    // Calcul des scores pour chaque dimension
    const practicalSkills = responses[0] || 50;
    const tradeInterest = responses[1] || 50;
    const selfLearningCapacity = responses[2] || 50;
    const entrepreneurialAptitude = responses[3] || 50;
    const careerPotential = (practicalSkills + tradeInterest + selfLearningCapacity + entrepreneurialAptitude) / 4;

    // Recommandations de secteurs basées sur les réponses
    const recommendedPaths = [];
    if (practicalSkills > 70 && tradeInterest > 70) {
      recommendedPaths.push("Artisanat", "Construction", "Réparation");
    } else if (entrepreneurialAptitude > 70) {
      recommendedPaths.push("Commerce", "Services à la personne", "Freelance");
    } else {
      recommendedPaths.push("Vente", "Assistanat", "Services en ligne");
    }

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 85; // valeur par défaut, à affiner si nécessaire

    return {
      practicalSkills,
      entrepreneurialAptitude,
      tradeInterest,
      selfLearningCapacity,
      recommendedPaths,
      confidenceScore,
      careerPotential
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test d'Orientation Sans Diplôme</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {noDiplomaCareerQuestions.length}
            </h2>
            <p className="text-lg mb-4">{noDiplomaCareerQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / noDiplomaCareerQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {noDiplomaCareerQuestions[currentQuestion].options.map((option, index) => (
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
