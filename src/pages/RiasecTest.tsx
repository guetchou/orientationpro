
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { questions } from "@/data/riasecQuestions";
import { analyzeRiasecSmartly, enhanceResultsWithAI } from "@/utils/smartAnalysis";

const RiasecTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleTestCompletion(newAnswers);
    }
  };

  const handleTestCompletion = async (finalAnswers: number[]) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder vos résultats");
        return;
      }

      // Utiliser notre nouvelle analyse intelligente
      const results = analyzeRiasecSmartly(finalAnswers);
      // Enrichir les résultats avec l'IA
      const aiEnhancedResults = enhanceResultsWithAI('RIASEC', results);
      
      // Combiner les résultats standards et ceux enrichis par l'IA
      const combinedResults = {
        ...results,
        aiInsights: aiEnhancedResults
      };
      
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          test_type: 'RIASEC',
          results: combinedResults,
          answers: finalAnswers,
          confidence_score: results.confidenceScore,
          personality_code: results.personalityCode
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving test results:", error);
        throw error;
      }

      toast.success("Test complété avec succès !");
      setTestCompleted(true);
      setTestId(data.id);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des résultats:", error);
      toast.error("Erreur lors de la sauvegarde des résultats");
    } finally {
      setLoading(false);
    }
  };

  const showPartialResults = () => {
    navigate(`/dashboard/results`);
  };

  // Fonction pour afficher une question adaptative (exemple simple)
  const getAdaptiveQuestion = () => {
    // La logique simple d'adaptation - dans une version avancée, 
    // on adapterait les questions en fonction des réponses précédentes
    return questions[currentQuestion];
  };

  const currentAdaptiveQuestion = getAdaptiveQuestion();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {!testCompleted ? (
          <Card className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="font-heading text-2xl font-bold text-center mb-2">
                Test d'orientation RIASEC
              </h1>
              <p className="text-gray-600 text-center">
                Question {currentQuestion + 1} sur {questions.length}
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-center mb-8">
                {currentAdaptiveQuestion.question}
              </p>

              <div className="grid gap-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    variant={score === 5 ? "default" : "outline"}
                    className="w-full py-6"
                    disabled={loading}
                  >
                    {score === 1 && "Pas du tout"}
                    {score === 2 && "Un peu"}
                    {score === 3 && "Moyennement"}
                    {score === 4 && "Beaucoup"}
                    {score === 5 && "Passionnément"}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto p-6 text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-heading text-2xl font-bold mb-4">
                Test RIASEC complété avec succès !
              </h1>
              <p className="text-gray-600 mb-8">
                Votre profil d'orientation a été analysé par notre IA avancée. Vous pouvez maintenant consulter vos résultats détaillés.
              </p>
              <Button 
                size="lg" 
                onClick={showPartialResults}
                className="mx-auto"
              >
                Voir mes résultats
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiasecTest;
