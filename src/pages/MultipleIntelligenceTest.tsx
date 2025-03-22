
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeMultipleIntelligenceSmartly, enhanceResultsWithAI } from "@/utils/smartAnalysis";

export default function MultipleIntelligenceTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
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
      // Utiliser notre nouvelle analyse intelligente
      const results = analyzeMultipleIntelligenceSmartly(newAnswers);
      // Enrichir les résultats avec l'IA
      const aiEnhancedResults = enhanceResultsWithAI('multiple_intelligence', results);
      
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
            test_type: 'multiple_intelligence',
            results: combinedResults,
            answers: newAnswers,
            confidence_score: results.confidenceScore
          });
          toast.success("Test complété avec succès !");
        } else {
          toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        }
        navigate('/dashboard/results', { state: { results: combinedResults, testType: 'multiple_intelligence' } });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test des Intelligences Multiples</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {intelligenceQuestions.length}
            </h2>
            <p className="text-lg mb-4">{intelligenceQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
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
