
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { LearningStyleResults } from "@/types/test";

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
      // Analyser les résultats
      const results: LearningStyleResults = analyzeLearningStyle(newAnswers);
      
      try {
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('learning_style', results);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          // Sauvegarder les résultats dans Supabase
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'learning_style',
            results: JSON.stringify({
              ...results,
              aiInsights
            }),
            answers: newAnswers,
            confidence_score: results.confidenceScore || 80
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
            testType: 'learning_style'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  const analyzeLearningStyle = (responses: string[]): LearningStyleResults => {
    // Initialiser les scores à 25 (valeur de base)
    let visual = 25;
    let auditory = 25;
    let kinesthetic = 25;
    let reading = 25;

    // Analyser chaque réponse et ajuster les scores
    responses.forEach((response, index) => {
      if (index === 0) {
        // Question 1
        if (response.includes("écrit")) reading += 25;
        else if (response.includes("visuelle") || response.includes("démonstration")) visual += 25;
        else if (response.includes("écoutant")) auditory += 25;
        else if (response.includes("essayant")) kinesthetic += 25;
      } else if (index === 1) {
        // Question 2
        if (response.includes("manuel") || response.includes("lire")) reading += 25;
        else if (response.includes("vidéo") || response.includes("regarder")) visual += 25;
        else if (response.includes("écouter") || response.includes("expert")) auditory += 25;
        else if (response.includes("expérimenter")) kinesthetic += 25;
      } else if (index === 2) {
        // Question 3
        if (response.includes("notes")) reading += 25;
        else if (response.includes("schémas") || response.includes("diagrammes")) visual += 25;
        else if (response.includes("voix") || response.includes("répétant")) auditory += 25;
        else if (response.includes("pratique")) kinesthetic += 25;
      }
    });

    // Normaliser les scores pour qu'ils soient sur 100
    const totalScore = visual + auditory + kinesthetic + reading;
    visual = Math.round((visual / totalScore) * 100);
    auditory = Math.round((auditory / totalScore) * 100);
    kinesthetic = Math.round((kinesthetic / totalScore) * 100);
    reading = Math.round((reading / totalScore) * 100);

    // Déterminer les styles primaire et secondaire
    const styles = [
      { name: "Visuel", score: visual },
      { name: "Auditif", score: auditory },
      { name: "Kinesthésique", score: kinesthetic },
      { name: "Lecture/Écriture", score: reading }
    ];
    styles.sort((a, b) => b.score - a.score);
    
    const primary = styles[0].name;
    const secondary = styles[1].name;

    // Créer des recommandations basées sur le style primaire
    const recommendedStrategies = [];
    if (primary === "Visuel") {
      recommendedStrategies.push("Utilisez des schémas et des graphiques pour apprendre");
      recommendedStrategies.push("Regardez des vidéos éducatives sur les sujets à étudier");
      recommendedStrategies.push("Créez des cartes mentales pour organiser l'information");
    } else if (primary === "Auditif") {
      recommendedStrategies.push("Enregistrez et écoutez les cours ou conférences");
      recommendedStrategies.push("Participez à des discussions de groupe");
      recommendedStrategies.push("Lisez à voix haute pour mieux mémoriser");
    } else if (primary === "Kinesthésique") {
      recommendedStrategies.push("Apprenez en faisant des exercices pratiques");
      recommendedStrategies.push("Bougez pendant l'apprentissage (marcher, manipuler des objets)");
      recommendedStrategies.push("Utilisez des jeux de rôle ou des simulations");
    } else if (primary === "Lecture/Écriture") {
      recommendedStrategies.push("Prenez des notes détaillées");
      recommendedStrategies.push("Faites des résumés écrits des concepts");
      recommendedStrategies.push("Utilisez des listes et des définitions");
    }

    return {
      visual,
      auditory,
      kinesthetic,
      reading,
      primary,
      secondary,
      recommendedStrategies,
      confidenceScore: 80
    };
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
