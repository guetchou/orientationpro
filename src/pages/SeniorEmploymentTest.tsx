import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { SeniorEmploymentResults } from "@/types/test";
import axios from "axios";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function SeniorEmploymentTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
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
      // Analyser les résultats
      const results: SeniorEmploymentResults = analyzeSeniorEmploymentResults(newAnswers);
      
      try {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test d'Aptitude à l'Emploi Senior</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {seniorEmploymentQuestions.length}
            </h2>
            <p className="text-lg mb-4">{seniorEmploymentQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
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
