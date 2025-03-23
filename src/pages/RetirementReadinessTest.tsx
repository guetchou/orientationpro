import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { RetirementReadinessResults } from "@/types/test";
import axios from "axios";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function RetirementReadinessTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const retirementReadinessQuestions = [
    {
      id: 1,
      question: "Êtes-vous satisfait de votre situation financière actuelle ?",
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
      question: "Avez-vous un plan de santé pour la retraite ?",
      options: [
        { text: "Aucun plan", value: 10 },
        { text: "Quelques idées", value: 30 },
        { text: "Plan en cours d'élaboration", value: 50 },
        { text: "Plan bien défini", value: 70 },
        { text: "Plan très détaillé", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Avez-vous des activités sociales ou des loisirs prévus pour la retraite ?",
      options: [
        { text: "Aucune idée", value: 10 },
        { text: "Quelques centres d'intérêt", value: 30 },
        { text: "Plan en cours d'élaboration", value: 50 },
        { text: "Plan bien défini", value: 70 },
        { text: "Plan très détaillé", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Avez-vous un but ou un objectif pour votre retraite ?",
      options: [
        { text: "Aucun", value: 10 },
        { text: "Quelques idées", value: 30 },
        { text: "But en cours de définition", value: 50 },
        { text: "But bien défini", value: 70 },
        { text: "But très clair et motivant", value: 90 }
      ]
    },
    {
      id: 5,
      question: "Avez-vous des intérêts ou des passions que vous aimeriez explorer à la retraite ?",
      options: [
        { text: "Aucun", value: 10 },
        { text: "Quelques idées", value: 30 },
        { text: "Plusieurs centres d'intérêt", value: 50 },
        { text: "Nombreux centres d'intérêt", value: 70 },
        { text: "Liste exhaustive de passions", value: 90 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < retirementReadinessQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: RetirementReadinessResults = analyzeRetirementReadinessResults(newAnswers);
      
      try {
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
            testType: 'retirement_readiness'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
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

    // Calcul du score de préparation global
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

    // Recommandations basées sur les réponses
    const recommendedSteps = [];
    if (financialPreparation < 50) {
      recommendedSteps.push("Consulter un conseiller financier");
    }
    if (healthPlanning < 50) {
      recommendedSteps.push("Élaborer un plan de santé détaillé");
    }
    if (socialConnections < 50) {
      recommendedSteps.push("Rejoindre des groupes sociaux ou des clubs");
    }
    if (purposeClarity < 50) {
      recommendedSteps.push("Définir des objectifs clairs pour la retraite");
    }
    if (leisureInterests < 50) {
      recommendedSteps.push("Explorer de nouveaux loisirs et passions");
    }

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 80; // valeur par défaut, à affiner si nécessaire

    return {
      financialPreparation,
      healthPlanning,
      socialConnections,
      purposeClarity,
      leisureInterests,
      readinessLevel,
      recommendedSteps,
      confidenceScore
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test de Préparation à la Retraite</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {retirementReadinessQuestions.length}
            </h2>
            <p className="text-lg mb-4">{retirementReadinessQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / retirementReadinessQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {retirementReadinessQuestions[currentQuestion].options.map((option, index) => (
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
