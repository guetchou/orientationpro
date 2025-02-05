import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

export default function MultipleIntelligenceTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < intelligenceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      const results = analyzeIntelligenceResults(newAnswers);
      
      // Save results to database
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'multiple_intelligence',
            results: results,
            answers: newAnswers
          });
        }
        navigate('/test-results', { state: { results, testType: 'multiple_intelligence' } });
      } catch (error) {
        console.error('Error saving results:', error);
      }
    }
  };

  const analyzeIntelligenceResults = (answers: string[]) => {
    // Initialize intelligence types
    const intelligenceTypes = {
      linguistic: 0,
      logical: 0,
      spatial: 0,
      musical: 0,
      bodily: 0,
      interpersonal: 0
    };

    // Analyze each answer
    answers.forEach((answer, index) => {
      switch (index) {
        case 0:
          if (answer.includes("lisant")) intelligenceTypes.linguistic += 3;
          if (answer.includes("écoutant")) intelligenceTypes.musical += 2;
          if (answer.includes("manipulant")) intelligenceTypes.bodily += 3;
          if (answer.includes("observant")) intelligenceTypes.spatial += 3;
          break;
        case 1:
          if (answer.includes("mathématiques")) intelligenceTypes.logical += 3;
          if (answer.includes("musique")) intelligenceTypes.musical += 3;
          if (answer.includes("sport")) intelligenceTypes.bodily += 3;
          if (answer.includes("dessiner")) intelligenceTypes.spatial += 3;
          break;
        case 2:
          if (answer.includes("listes")) intelligenceTypes.logical += 2;
          if (answer.includes("mentales")) intelligenceTypes.spatial += 2;
          if (answer.includes("discutant")) intelligenceTypes.interpersonal += 3;
          if (answer.includes("croquis")) intelligenceTypes.spatial += 2;
          break;
      }
    });

    return intelligenceTypes;
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