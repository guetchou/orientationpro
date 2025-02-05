import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emotionalQuestions = [
  {
    id: 1,
    question: "Comment réagissez-vous face à une situation stressante ?",
    options: [
      "Je reste calme et analyse la situation",
      "Je deviens anxieux(se) mais je gère",
      "Je perds facilement mon sang-froid",
      "Je cherche de l'aide auprès des autres"
    ]
  },
  {
    id: 2,
    question: "Comment gérez-vous vos émotions au travail/à l'école ?",
    options: [
      "Je les exprime de manière constructive",
      "Je les garde pour moi",
      "Je les partage avec mes collègues/camarades",
      "J'ai du mal à les contrôler"
    ]
  },
  {
    id: 3,
    question: "Comment percevez-vous les émotions des autres ?",
    options: [
      "Je suis très empathique",
      "J'ai parfois du mal à les comprendre",
      "Je suis attentif(ve) mais objectif(ve)",
      "Je préfère rester distant(e)"
    ]
  }
];

export default function EmotionalTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < emotionalQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const results = analyzeEmotionalResults(newAnswers);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'emotional',
            results: results,
            answers: newAnswers
          });
          toast.success("Test complété avec succès !");
        } else {
          toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        }
        navigate('/dashboard/results', { state: { results, testType: 'emotional' } });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  const analyzeEmotionalResults = (answers: string[]) => {
    const categories = {
      selfAwareness: 0,
      selfRegulation: 0,
      empathy: 0
    };

    answers.forEach((answer, index) => {
      switch (index) {
        case 0:
          if (answer.includes("calme")) categories.selfRegulation += 3;
          if (answer.includes("anxieux")) categories.selfRegulation += 2;
          if (answer.includes("sang-froid")) categories.selfRegulation += 1;
          if (answer.includes("aide")) categories.empathy += 2;
          break;
        case 1:
          if (answer.includes("constructive")) categories.selfAwareness += 3;
          if (answer.includes("garde")) categories.selfRegulation += 2;
          if (answer.includes("partage")) categories.empathy += 3;
          break;
        case 2:
          if (answer.includes("empathique")) categories.empathy += 3;
          if (answer.includes("attentif")) categories.empathy += 2;
          if (answer.includes("distant")) categories.selfAwareness += 1;
          break;
      }
    });

    return categories;
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
          </div>

          <div className="space-y-4">
            {emotionalQuestions[currentQuestion].options.map((option, index) => (
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