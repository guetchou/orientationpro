import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { LearningStyleResults } from "@/types/test";
import axios from "axios";

// Récupère le backend URL depuis les variables d'environnement ou utilise une valeur par défaut
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function LearningStyleTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const learningStyleQuestions = [
    {
      id: 1,
      question: "Quand j'apprends quelque chose de nouveau, je préfère :",
      options: [
        { text: "Voir des diagrammes ou des illustrations", value: 4 },
        { text: "Écouter une explication", value: 3 },
        { text: "Faire des exercices pratiques", value: 5 },
        { text: "Lire des instructions écrites", value: 2 }
      ]
    },
    {
      id: 2,
      question: "Pour me souvenir d'une information, je préfère :",
      options: [
        { text: "Visualiser une image mentale", value: 4 },
        { text: "Répéter l'information à voix haute", value: 3 },
        { text: "Écrire ou gribouiller des notes", value: 2 },
        { text: "Manipuler des objets liés à l'information", value: 5 }
      ]
    },
    {
      id: 3,
      question: "En général, je comprends mieux quand :",
      options: [
        { text: "Je vois comment les choses fonctionnent", value: 4 },
        { text: "Quelqu'un m'explique les choses", value: 3 },
        { text: "Je peux expérimenter par moi-même", value: 5 },
        { text: "Je lis des informations détaillées", value: 2 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < learningStyleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: LearningStyleResults = analyzeLearningStyleResults(newAnswers);
      
      try {
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('learning_style', results);
        
        // Récupération de l'utilisateur connecté depuis le service d'authentification local
        const userResponse = await axios.get(`${backendUrl}/api/users/current`, {
          withCredentials: true  // Important pour envoyer les cookies d'authentification
        });
        const user = userResponse.data;
        
        if (user?.id) {
          // Sauvegarder les résultats dans le backend
          await axios.post(`${backendUrl}/api/test-results`, {
            user_id: user.id,
            test_type: 'learning_style',
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
            testType: 'learning_style'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  // Analyse des résultats des styles d'apprentissage
  const analyzeLearningStyleResults = (responses: number[]): LearningStyleResults => {
    // Calcul des scores pour chaque style
    const visual = responses.reduce((sum, val, index) => (learningStyleQuestions[index].options[0].value === 4 ? sum + val : sum), 0);
    const auditory = responses.reduce((sum, val, index) => (learningStyleQuestions[index].options[1].value === 3 ? sum + val : sum), 0);
    const kinesthetic = responses.reduce((sum, val, index) => (learningStyleQuestions[index].options[2].value === 5 ? sum + val : sum), 0);
    const reading = responses.reduce((sum, val, index) => (learningStyleQuestions[index].options[3].value === 2 ? sum + val : sum), 0);

    // Déterminer le style dominant
    const styles = [
      { style: 'visual', score: visual },
      { style: 'auditory', score: auditory },
      { style: 'kinesthetic', score: kinesthetic },
      { style: 'reading', score: reading }
    ];
    styles.sort((a, b) => b.score - a.score);
    const primaryStyle = styles[0].style;
    const secondaryStyle = styles[1].style;

    // Recommandations basées sur le style dominant
    const recommendedStrategies = [];
    if (primaryStyle === 'visual') {
      recommendedStrategies.push("Utiliser des graphiques et des diagrammes", "Prendre des notes visuelles", "Regarder des vidéos éducatives");
    } else if (primaryStyle === 'auditory') {
      recommendedStrategies.push("Écouter des podcasts ou des conférences", "Participer à des discussions de groupe", "Enregistrer des notes vocales");
    } else if (primaryStyle === 'kinesthetic') {
      recommendedStrategies.push("Faire des expériences pratiques", "Utiliser des modèles ou des simulations", "Bouger pendant l'étude");
    } else {
      recommendedStrategies.push("Lire des livres et des articles", "Écrire des résumés", "Faire des recherches approfondies");
    }

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 75; // valeur par défaut, à affiner si nécessaire

    return {
      visual,
      auditory,
      kinesthetic,
      reading,
      dominantStyle: primaryStyle,
      secondary: secondaryStyle,
      recommendedStrategies,
      confidenceScore
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test de Styles d'Apprentissage</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {learningStyleQuestions.length}
            </h2>
            <p className="text-lg mb-4">{learningStyleQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / learningStyleQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {learningStyleQuestions[currentQuestion].options.map((option, index) => (
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
