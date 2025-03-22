
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { SeniorEmploymentResults } from "@/types/test";

export default function SeniorEmploymentTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const seniorQuestions = [
    {
      id: 1,
      question: "Comment évaluez-vous la valeur de votre expérience professionnelle ?",
      options: [
        { text: "Peu valorisable aujourd'hui", value: 10 },
        { text: "Modérément valorisable", value: 30 },
        { text: "Valorisable dans certains domaines", value: 50 },
        { text: "Très valorisable", value: 70 },
        { text: "Extrêmement valorisable et recherchée", value: 90 }
      ]
    },
    {
      id: 2,
      question: "Comment jugez-vous votre adaptation aux nouvelles technologies ?",
      options: [
        { text: "Très difficile", value: 10 },
        { text: "Difficile", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Bonne", value: 70 },
        { text: "Excellente", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Quel équilibre travail-vie personnelle recherchez-vous ?",
      options: [
        { text: "Je veux travailler à temps plein", value: 10 },
        { text: "Je préfère un temps plein mais suis flexible", value: 30 },
        { text: "Je cherche un équilibre 50/50", value: 50 },
        { text: "Je préfère travailler à temps partiel", value: 70 },
        { text: "Je cherche une activité très flexible ou ponctuelle", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Souhaitez-vous transmettre votre savoir-faire aux plus jeunes ?",
      options: [
        { text: "Pas du tout", value: 10 },
        { text: "Un peu", value: 30 },
        { text: "Modérément", value: 50 },
        { text: "Beaucoup", value: 70 },
        { text: "C'est ma principale motivation", value: 90 }
      ]
    },
    {
      id: 5,
      question: "Avez-vous besoin de flexibilité dans votre emploi (horaires, lieu) ?",
      options: [
        { text: "Pas du tout", value: 10 },
        { text: "Un peu", value: 30 },
        { text: "Modérément", value: 50 },
        { text: "Beaucoup", value: 70 },
        { text: "C'est essentiel pour moi", value: 90 }
      ]
    }
  ];

  const handleAnswer = async (answer: number) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < seniorQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Analyser les résultats
      const results: SeniorEmploymentResults = analyzeSeniorResults(newAnswers);
      
      try {
        // Enrichir les résultats avec l'IA
        const aiInsights = await getAIEnhancedAnalysis('senior_employment', results);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          // Sauvegarder les résultats dans Supabase
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'senior_employment',
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
            testType: 'senior_employment'
          } 
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast.error("Erreur lors de la sauvegarde des résultats");
      }
    }
  };

  // Analyse des résultats pour l'emploi senior
  const analyzeSeniorResults = (responses: number[]): SeniorEmploymentResults => {
    // Calcul des scores pour chaque dimension
    const experienceValue = responses[0] || 50;
    const technologyAdaptation = responses[1] || 50;
    const workLifeBalance = responses[2] || 50;
    const mentorshipPotential = responses[3] || 50;
    const flexibilityNeeds = responses[4] || 50;

    // Calcul du score d'employabilité
    const employabilityScore = Math.round(
      (experienceValue * 0.3) +
      (technologyAdaptation * 0.25) +
      (workLifeBalance * 0.15) +
      (mentorshipPotential * 0.15) +
      (flexibilityNeeds * 0.15)
    );

    // Recommandations de rôles basées sur les réponses
    const recommendedRoles = [];
    
    if (mentorshipPotential > 70) {
      recommendedRoles.push("Mentor ou coach dans votre domaine d'expertise");
      recommendedRoles.push("Formateur professionnel");
    }
    
    if (technologyAdaptation > 70) {
      recommendedRoles.push("Consultant en transition numérique");
      recommendedRoles.push("Chef de projet senior");
    }
    
    if (workLifeBalance > 70 || flexibilityNeeds > 70) {
      recommendedRoles.push("Travail à temps partiel dans votre secteur");
      recommendedRoles.push("Consultant indépendant avec horaires flexibles");
    }
    
    if (experienceValue > 70) {
      recommendedRoles.push("Expert-conseil dans votre domaine");
      recommendedRoles.push("Médiateur ou facilitateur d'équipe");
    }
    
    if (recommendedRoles.length === 0) {
      recommendedRoles.push("Poste adapté dans votre secteur d'expertise");
      recommendedRoles.push("Reconversion vers un secteur valorisant l'expérience");
    }

    // Niveau de confiance
    const confidenceScore = 80;

    return {
      experienceValue,
      technologyAdaptation,
      workLifeBalance,
      mentorshipPotential,
      flexibilityNeeds,
      employabilityScore,
      recommendedRoles,
      confidenceScore
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test Emploi Senior</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} sur {seniorQuestions.length}
            </h2>
            <p className="text-lg mb-4">{seniorQuestions[currentQuestion].question}</p>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4 mb-6">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / seniorQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {seniorQuestions[currentQuestion].options.map((option, index) => (
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
