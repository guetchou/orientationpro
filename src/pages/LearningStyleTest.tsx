
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeLearningStyleSmartly, enhanceResultsWithAI } from "@/utils/smartAnalysis";

export default function LearningStyleTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const learningQuestions = [
    {
      id: 1,
      question: "Comment préférez-vous recevoir des instructions ?",
      options: [
        "Par écrit avec des explications détaillées",
        "À travers une démonstration visuelle",
        "En écoutant quelqu'un expliquer",
        "En essayant par vous-même"
      ]
    },
    {
      id: 2,
      question: "Lors de l'apprentissage d'une nouvelle compétence, vous préférez :",
      options: [
        "Lire le manuel d'instructions",
        "Regarder une vidéo tutorielle",
        "Écouter un expert expliquer",
        "Expérimenter directement"
      ]
    },
    {
      id: 3,
      question: "Comment mémorisez-vous le mieux l'information ?",
      options: [
        "En prenant des notes",
        "En créant des schémas ou des diagrammes",
        "En répétant à voix haute",
        "En mettant en pratique"
      ]
    }
  ];

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < learningQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Utiliser notre nouvelle analyse intelligente
      const results = analyzeLearningStyleSmartly(newAnswers);
      // Enrichir les résultats avec l'IA
      const aiEnhancedResults = enhanceResultsWithAI('learning_style', results);
      
      // Combiner les résultats standards et ceux enrichis par l'IA
      const combinedResults = {
        ...results,
        aiInsights: aiEnhancedResults
      };
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'learning_style',
            results: combinedResults,
            answers: newAnswers,
            confidence_score: results.confidenceScore
          });
          toast.success("Test complété avec succès !");
        } else {
          toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        }
        navigate('/dashboard/results', { state: { results: combinedResults, testType: 'learning_style' } });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test de Style d'Apprentissage</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {learningQuestions.length}
            </h2>
            <p className="text-lg mb-4">{learningQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-secondary h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / learningQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {learningQuestions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="w-full text-left justify-start h-auto py-4 px-6"
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
