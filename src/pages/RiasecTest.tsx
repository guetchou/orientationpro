import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { questions } from "@/data/riasecQuestions";
import { performAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { motion } from "framer-motion";
import { TestDescription } from "@/components/tests/TestDescription";
import { TestCompletion } from "@/components/tests/TestCompletion";
import { Brain, BookOpen, Target, Briefcase } from "lucide-react";
import { TestHeader } from "@/components/tests/riasec/TestHeader";
import { QuestionDisplay } from "@/components/tests/riasec/QuestionDisplay";
import { analyzeRiasecResults } from "@/components/tests/riasec/RiasecAnalyzer";

const RiasecTest = () => {
  const navigate = useNavigate();
  const [showDescription, setShowDescription] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);

  const handleStartTest = () => {
    setShowDescription(false);
  };

  const handleAnswer = (score: number) => {
    // Animation de transition pour la réponse
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
      
      // Analyser les résultats
      const results = analyzeRiasecResults(finalAnswers);
      
      // Enrichir les résultats avec l'IA
      const aiInsights = await performAIEnhancedAnalysis({test_type: 'RIASEC', results});
      
      if (user) {
        // Sauvegarder les résultats dans Supabase
        const { data, error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_type: 'RIASEC',
            results: JSON.stringify({
              ...results,
              aiInsights
            }),
            answers: finalAnswers,
            confidence_score: results.confidenceScore || 85,
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
      } else {
        // Si l'utilisateur n'est pas connecté, on ne sauvegarde pas les résultats
        // mais on affiche quand même l'écran de complétion
        toast.info("Pour sauvegarder vos résultats, vous devez vous connecter");
        setTestCompleted(true);
      }
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

  if (showDescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4">
          <TestDescription 
            title="Test d'orientation RIASEC"
            description="Le test RIASEC, également connu sous le nom de test de Holland, vous aide à déterminer votre personnalité professionnelle selon six catégories: Réaliste, Investigateur, Artistique, Social, Entreprenant et Conventionnel. Ce test est scientifiquement validé pour vous orienter vers des carrières adaptées à votre profil."
            time="5-10 minutes"
            benefits={[
              "Découvrir les métiers qui correspondent à votre personnalité",
              "Comprendre vos préférences professionnelles",
              "Obtenir une analyse détaillée de votre profil RIASEC",
              "Recevoir des recommandations de carrières personnalisées"
            ]}
            onStart={handleStartTest}
          />
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8"
          >
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center"
            >
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Basé sur la recherche</h3>
              <p className="text-sm text-gray-500 mt-1">Développé par des psychologues de l'orientation</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center"
            >
              <div className="bg-purple-100 p-3 rounded-full mb-3">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Précision élevée</h3>
              <p className="text-sm text-gray-500 mt-1">Des résultats personnalisés et pertinents</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center"
            >
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Orientation concrète</h3>
              <p className="text-sm text-gray-500 mt-1">Des métiers et formations recommandés</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {!testCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto p-6 border-2 border-primary/10 bg-white">
              <TestHeader 
                currentQuestion={currentQuestion}
                totalQuestions={questions.length}
              />

              <QuestionDisplay
                currentQuestion={currentQuestion}
                question={currentAdaptiveQuestion}
                onAnswer={handleAnswer}
                loading={loading}
              />
            </Card>
          </motion.div>
        ) : (
          <TestCompletion 
            title="RIASEC" 
            onViewResults={showPartialResults} 
          />
        )}
      </div>
    </div>
  );
};

export default RiasecTest;
