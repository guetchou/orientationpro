
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { RetirementReadinessResults } from "@/types/test";

export default function RetirementReadinessTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const retirementQuestions = [
    {
      id: 1,
      question: "Comment évaluez-vous votre préparation financière à la retraite ?",
      options: [
        { text: "Je n'ai pas commencé à préparer ma retraite", value: 10 },
        { text: "J'ai un début d'épargne mais insuffisant", value: 30 },
        { text: "J'ai une épargne moyenne mais je m'inquiète", value: 50 },
        { text: "J'ai un bon plan d'épargne retraite", value: 70 },
        { text: "Ma retraite est totalement planifiée et sécurisée", value: 90 }
      ]
    },
    {
      id: 2,
      question: "Avez-vous réfléchi à votre santé et bien-être pour vos années de retraite ?",
      options: [
        { text: "Pas du tout", value: 10 },
        { text: "Très peu", value: 30 },
        { text: "Moyennement", value: 50 },
        { text: "Oui, j'ai un plan", value: 70 },
        { text: "Oui, c'est une priorité absolue pour moi", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Comment évaluez-vous votre réseau social en dehors de votre cadre professionnel ?",
      options: [
        { text: "Très limité, mes relations sont surtout professionnelles", value: 10 },
        { text: "Assez restreint", value: 30 },
        { text: "Moyen", value: 50 },
        { text: "Bon", value: 70 },
        { text: "Très développé", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Avez-vous une vision claire de ce qui donnera du sens à votre vie après le travail ?",
      options: [
        { text: "Pas du tout", value: 10 },
        { text: "Vaguement", value: 30 },
        { text: "J'y réfléchis", value: 50 },
        { text: "Assez clairement", value: 70 },
        { text: "Très clairement", value: 90 }
      ]
    },
    {
      id: 5,
      question: "Quels sont vos centres d'intérêt et loisirs en dehors du travail ?",
      options: [
        { text: "Je n'ai pas de loisirs particuliers", value: 10 },
        { text: "J'ai quelques intérêts mais peu développés", value: 30 },
        { text: "J'ai des loisirs occasionnels", value: 50 },
        { text: "J'ai plusieurs passions", value: 70 },
        { text: "J'ai une vie très riche en dehors du travail", value: 90 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < retirementQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: RetirementReadinessResults = analyzeRetirementResults(newAnswers);
      
      try {
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('retirement_readiness', results);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          // Sauvegarder les résultats dans Supabase
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'retirement_readiness',
            results: {
              ...results,
              aiInsights
            },
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
            testType: 'retirement_readiness'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  // Analyse des résultats de préparation à la retraite
  const analyzeRetirementResults = (responses: number[]): RetirementReadinessResults => {
    // Calcul des scores pour chaque dimension
    const financialPreparation = responses[0] || 50;
    const healthPlanning = responses[1] || 50;
    const socialConnections = responses[2] || 50;
    const purposeClarity = responses[3] || 50;
    const leisureInterests = responses[4] || 50;

    // Calcul du score global de préparation
    const readinessScore = Math.round(
      (financialPreparation * 0.3) +
      (healthPlanning * 0.2) +
      (socialConnections * 0.15) +
      (purposeClarity * 0.2) +
      (leisureInterests * 0.15)
    );

    // Priorités d'action basées sur les dimensions les plus faibles
    const dimensions = [
      { name: "Planification financière", value: financialPreparation },
      { name: "Planification santé", value: healthPlanning },
      { name: "Développement réseau social", value: socialConnections },
      { name: "Définition d'un projet de vie", value: purposeClarity },
      { name: "Développement de loisirs", value: leisureInterests }
    ];
    
    // Trier les dimensions par valeur (plus faible en premier)
    dimensions.sort((a, b) => a.value - b.value);
    
    // Prendre les 3 dimensions les plus faibles comme priorités
    const actionPriorities = dimensions.slice(0, 3).map(d => d.name);

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 85; // valeur par défaut, à affiner si nécessaire

    return {
      financialPreparation,
      healthPlanning,
      socialConnections,
      purposeClarity,
      leisureInterests,
      readinessScore,
      actionPriorities,
      confidenceScore
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test de Préparation à la Retraite</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {retirementQuestions.length}
            </h2>
            <p className="text-lg mb-4">{retirementQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / retirementQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {retirementQuestions[currentQuestion].options.map((option, index) => (
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
