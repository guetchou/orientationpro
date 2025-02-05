import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

export default function LearningStyleTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < learningQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      const results = analyzeLearningResults(newAnswers);
      
      // Save results to database
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'learning_style',
            results: results,
            answers: newAnswers
          });
        }
        navigate('/test-results', { state: { results, testType: 'learning_style' } });
      } catch (error) {
        console.error('Error saving results:', error);
      }
    }
  };

  const analyzeLearningResults = (answers: string[]) => {
    // Initialize learning styles
    const learningStyles = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0
    };

    // Analyze each answer
    answers.forEach((answer, index) => {
      switch (index) {
        case 0:
          if (answer.includes("écrit")) learningStyles.reading += 3;
          if (answer.includes("visuelle")) learningStyles.visual += 3;
          if (answer.includes("écoutant")) learningStyles.auditory += 3;
          if (answer.includes("essayant")) learningStyles.kinesthetic += 3;
          break;
        case 1:
          if (answer.includes("manuel")) learningStyles.reading += 3;
          if (answer.includes("vidéo")) learningStyles.visual += 3;
          if (answer.includes("écouter")) learningStyles.auditory += 3;
          if (answer.includes("expérimenter")) learningStyles.kinesthetic += 3;
          break;
        case 2:
          if (answer.includes("notes")) learningStyles.reading += 3;
          if (answer.includes("schémas")) learningStyles.visual += 3;
          if (answer.includes("voix")) learningStyles.auditory += 3;
          if (answer.includes("pratique")) learningStyles.kinesthetic += 3;
          break;
      }
    });

    return learningStyles;
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