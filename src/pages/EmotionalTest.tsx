
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { EmotionalResults } from "@/types/test";
import axios from "axios";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function EmotionalTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const emotionalQuestions = [
    {
      id: 1,
      question: "Comment réagissez-vous face à une situation stressante ?",
      options: [
        { text: "Je reste calme et analyse la situation", value: 5 },
        { text: "Je deviens anxieux(se) mais je gère", value: 3 },
        { text: "Je perds facilement mon sang-froid", value: 1 },
        { text: "Je cherche de l'aide auprès des autres", value: 4 }
      ]
    },
    {
      id: 2,
      question: "Comment gérez-vous vos émotions au travail/à l'école ?",
      options: [
        { text: "Je les exprime de manière constructive", value: 5 },
        { text: "Je les garde pour moi", value: 2 },
        { text: "Je les partage avec mes collègues/camarades", value: 4 },
        { text: "J'ai du mal à les contrôler", value: 1 }
      ]
    },
    {
      id: 3,
      question: "Comment percevez-vous les émotions des autres ?",
      options: [
        { text: "Je suis très empathique", value: 5 },
        { text: "J'ai parfois du mal à les comprendre", value: 2 },
        { text: "Je suis attentif(ve) mais objectif(ve)", value: 4 },
        { text: "Je préfère rester distant(e)", value: 1 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < emotionalQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: EmotionalResults = {
        selfAwareness: Math.round((newAnswers[0] / 5) * 100),
        selfRegulation: Math.round((newAnswers[1] / 5) * 100),
        motivation: 70, // valeur par défaut
        empathy: Math.round((newAnswers[2] / 5) * 100),
        socialSkills: 65, // valeur par défaut
        dominantTrait: determineDominantTrait(newAnswers),
        overallScore: Math.round((newAnswers.reduce((sum, val) => sum + val, 0) / (newAnswers.length * 5)) * 100),
        strengths: ['Conscience de soi', 'Gestion des émotions'],
        areasToImprove: ['Communication émotionnelle'],
        confidenceScore: 85
      };
      
      try {
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
      }
    }
  };

  // Fonction pour déterminer le trait dominant
  const determineDominantTrait = (answers: number[]): string => {
    const traits = ["Conscience de soi", "Auto-régulation", "Empathie"];
    const index = answers.indexOf(Math.max(...answers));
    return traits[index] || "Équilibré";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test d'Intelligence Émotionnelle</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {emotionalQuestions.length}
            </h2>
            <p className="text-lg mb-4">{emotionalQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all"
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
