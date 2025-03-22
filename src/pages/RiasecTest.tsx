
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { questions } from "@/data/riasecQuestions";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { RiasecResults } from "@/types/test";
import { motion, AnimatePresence } from "framer-motion";
import { TestDescription } from "@/components/tests/TestDescription";
import { TestCompletion } from "@/components/tests/TestCompletion";
import { Brain, BookOpen, Target, TrendingUp, Briefcase } from "lucide-react";

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
      const results: RiasecResults = analyzeRiasecResults(finalAnswers);
      
      // Enrichir les résultats avec l'IA
      const aiInsights = await getAIEnhancedAnalysis('RIASEC', results);
      
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

  const analyzeRiasecResults = (responses: number[]): RiasecResults => {
    // Initialiser les scores RIASEC
    let realistic = 0;
    let investigative = 0;
    let artistic = 0;
    let social = 0;
    let enterprising = 0;
    let conventional = 0;
    
    // Attribuer les réponses aux différentes catégories
    responses.forEach((response, index) => {
      const category = questions[index].category;
      
      switch (category) {
        case 'R':
          realistic += response;
          break;
        case 'I':
          investigative += response;
          break;
        case 'A':
          artistic += response;
          break;
        case 'S':
          social += response;
          break;
        case 'E':
          enterprising += response;
          break;
        case 'C':
          conventional += response;
          break;
      }
    });
    
    // Normaliser les scores sur 100
    const totalResponses = questions.filter(q => q.category === 'R').length;
    realistic = Math.round((realistic / (totalResponses * 5)) * 100);
    investigative = Math.round((investigative / (totalResponses * 5)) * 100);
    artistic = Math.round((artistic / (totalResponses * 5)) * 100);
    social = Math.round((social / (totalResponses * 5)) * 100);
    enterprising = Math.round((enterprising / (totalResponses * 5)) * 100);
    conventional = Math.round((conventional / (totalResponses * 5)) * 100);
    
    // Déterminer les types dominants
    const types = [
      { code: 'R', value: realistic },
      { code: 'I', value: investigative },
      { code: 'A', value: artistic },
      { code: 'S', value: social },
      { code: 'E', value: enterprising },
      { code: 'C', value: conventional }
    ];
    
    types.sort((a, b) => b.value - a.value);
    const dominantTypes = types.slice(0, 3).map(t => t.code);
    const personalityCode = dominantTypes.join('');
    
    return {
      realistic,
      investigative,
      artistic,
      social,
      enterprising,
      conventional,
      dominantTypes,
      personalityCode,
      confidenceScore: 85
    };
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
              <div className="mb-8">
                <h1 className="font-heading text-2xl font-bold text-center mb-2 text-primary">
                  Test d'orientation RIASEC
                </h1>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary/60" />
                  <p className="text-gray-600 text-center">
                    Question {currentQuestion + 1} sur {questions.length}
                  </p>
                </div>
                
                <motion.div 
                  className="w-full bg-gray-200 h-2 rounded-full mt-4"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <p className="text-lg text-center mb-8 font-medium text-gray-800">
                    {currentAdaptiveQuestion.question}
                  </p>

                  <div className="grid gap-3">
                    {[
                      { score: 1, label: "Pas du tout" },
                      { score: 2, label: "Un peu" },
                      { score: 3, label: "Moyennement" },
                      { score: 4, label: "Beaucoup" },
                      { score: 5, label: "Passionnément" }
                    ].map((option) => (
                      <motion.div
                        key={option.score}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: option.score * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--primary), 0.05)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleAnswer(option.score)}
                          variant={option.score === 5 ? "default" : "outline"}
                          className={`w-full py-6 justify-start px-6 ${
                            option.score === 5 
                              ? "bg-primary hover:bg-primary/90" 
                              : "hover:border-primary/30 hover:text-primary"
                          }`}
                          disabled={loading}
                        >
                          <div className="flex items-center">
                            <div className={`h-6 w-6 flex items-center justify-center rounded-full mr-3 border-2 ${
                              option.score === 5
                                ? "border-white/30 text-white"
                                : "border-gray-300 text-gray-400"
                            }`}>
                              {option.score}
                            </div>
                            <span className={option.score === 5 ? "text-white" : ""}>
                              {option.label}
                            </span>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
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
