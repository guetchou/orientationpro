
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { NoDiplomaCareerResults } from "@/types/test";

export default function NoDiplomaCareerTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const noDiplomaQuestions = [
    {
      id: 1,
      question: "Comment évaluez-vous vos compétences pratiques et manuelles ?",
      options: [
        { text: "Très faibles", value: 10 },
        { text: "Faibles", value: 30 },
        { text: "Moyennes", value: 50 },
        { text: "Bonnes", value: 70 },
        { text: "Excellentes", value: 90 }
      ]
    },
    {
      id: 2,
      question: "Avez-vous un esprit entrepreneurial ?",
      options: [
        { text: "Pas du tout", value: 10 },
        { text: "Un peu", value: 30 },
        { text: "Moyennement", value: 50 },
        { text: "Assez", value: 70 },
        { text: "Beaucoup", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Êtes-vous intéressé(e) par l'apprentissage d'un métier manuel ou technique ?",
      options: [
        { text: "Pas du tout intéressé(e)", value: 10 },
        { text: "Peu intéressé(e)", value: 30 },
        { text: "Moyennement intéressé(e)", value: 50 },
        { text: "Intéressé(e)", value: 70 },
        { text: "Très intéressé(e)", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Comment évaluez-vous votre capacité à apprendre par vous-même ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Bonne", value: 70 },
        { text: "Excellente", value: 90 }
      ]
    },
    {
      id: 5,
      question: "Avez-vous déjà réalisé des projets personnels que vous pourriez présenter comme expérience ?",
      options: [
        { text: "Aucun", value: 10 },
        { text: "Très peu", value: 30 },
        { text: "Quelques-uns", value: 50 },
        { text: "Plusieurs", value: 70 },
        { text: "Beaucoup", value: 90 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < noDiplomaQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: NoDiplomaCareerResults = analyzeNoDiplomaResults(newAnswers);
      
      try {
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('no_diploma_career', results);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          // Sauvegarder les résultats dans Supabase
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'no_diploma_career',
            results: JSON.stringify({
              ...results,
              aiInsights
            }),
            answers: newAnswers,
            confidence_score: results.confidenceScore || 75
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
            testType: 'no_diploma_career'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  // Analyse des résultats pour les personnes sans diplôme
  const analyzeNoDiplomaResults = (responses: number[]): NoDiplomaCareerResults => {
    // Calcul des scores pour chaque dimension
    const practicalSkills = responses[0] || 50;
    const entrepreneurialAptitude = responses[1] || 50;
    const tradeInterest = responses[2] || 50;
    const selfLearningCapacity = responses[3] || 50;
    const experiencePortfolio = responses[4] || 50;

    // Calcul du potentiel de carrière
    const careerPotential = Math.round(
      (practicalSkills * 0.25) +
      (entrepreneurialAptitude * 0.2) +
      (tradeInterest * 0.2) +
      (selfLearningCapacity * 0.2) +
      (experiencePortfolio * 0.15)
    );

    // Recommandations de parcours basées sur les réponses
    const recommendedPaths = [];
    
    if (practicalSkills > 70 && tradeInterest > 70) {
      recommendedPaths.push("Apprentissage en métiers manuels (plomberie, électricité, menuiserie)");
      recommendedPaths.push("Formation professionnelle courte en artisanat");
    }
    
    if (entrepreneurialAptitude > 70 && selfLearningCapacity > 70) {
      recommendedPaths.push("Création de micro-entreprise dans un domaine que vous maîtrisez");
      recommendedPaths.push("Développement d'une activité indépendante de services");
    }
    
    if (selfLearningCapacity > 70 && experiencePortfolio > 60) {
      recommendedPaths.push("Développement de compétences en ligne (marketing digital, développement web)");
      recommendedPaths.push("Création d'un portfolio de réalisations pour démontrer vos compétences");
    }
    
    if (recommendedPaths.length === 0) {
      recommendedPaths.push("Formation professionnelle dans un secteur en tension");
      recommendedPaths.push("Valorisation de vos expériences non-professionnelles");
      recommendedPaths.push("Accompagnement par des structures d'insertion professionnelle");
    }

    // Niveau de confiance
    const confidenceScore = 75;

    return {
      practicalSkills,
      entrepreneurialAptitude,
      tradeInterest,
      selfLearningCapacity,
      experiencePortfolio,
      careerPotential,
      recommendedPaths,
      confidenceScore
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test d'Orientation sans Diplôme</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {noDiplomaQuestions.length}
            </h2>
            <p className="text-lg mb-4">{noDiplomaQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / noDiplomaQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {noDiplomaQuestions[currentQuestion].options.map((option, index) => (
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
