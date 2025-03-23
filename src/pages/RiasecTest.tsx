
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionDisplay } from "@/components/tests/riasec/QuestionDisplay";
import { TestHeader } from "@/components/tests/riasec/TestHeader";
import { TestDescription } from "@/components/tests/TestDescription";
import { TestCompletion } from "@/components/tests/TestCompletion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { RiasecResults } from "@/types/test";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// Import the RIASEC questions
const riasecQuestions = [
  {
    question: "J'aime résoudre des problèmes mathématiques ou scientifiques.",
    category: "investigative"
  },
  {
    question: "J'aime construire ou réparer des objets.",
    category: "realistic"
  },
  {
    question: "J'aime travailler en équipe.",
    category: "social"
  },
  {
    question: "J'aime être organisé et suivre une routine.",
    category: "conventional"
  },
  {
    question: "J'aime dessiner, peindre ou jouer d'un instrument de musique.",
    category: "artistic"
  },
  {
    question: "J'aime persuader ou influencer les autres.",
    category: "enterprising"
  },
  {
    question: "J'aime faire des expériences et des recherches.",
    category: "investigative"
  },
  {
    question: "J'aime travailler avec des outils et des machines.",
    category: "realistic"
  },
  {
    question: "J'aime aider les autres à résoudre leurs problèmes.",
    category: "social"
  },
  {
    question: "J'aime suivre des instructions détaillées.",
    category: "conventional"
  },
  {
    question: "J'aime exprimer ma créativité.",
    category: "artistic"
  },
  {
    question: "J'aime diriger et prendre des décisions.",
    category: "enterprising"
  }
];

export default function RiasecTest() {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RiasecResults | null>(null);
  const navigate = useNavigate();

  // Reset the test if the user goes back to the start
  const resetTest = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
  };

  // Start the test
  const startTest = () => {
    setStarted(true);
  };

  // Handle the user's answer
  const handleAnswer = async (score: number) => {
    setLoading(true);
    // Add the answer to the array
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    
    // Move to the next question or complete the test
    if (currentQuestion < riasecQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setLoading(false);
    } else {
      // Test completed, calculate the results
      await completeTest(newAnswers);
    }
  };

  // Navigate to the previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Remove the last answer
      setAnswers(answers.slice(0, -1));
    }
  };

  // Calculate the RIASEC results
  const completeTest = async (finalAnswers: number[]) => {
    // Calculate the scores for each category
    let realistic = 0;
    let investigative = 0;
    let artistic = 0;
    let social = 0;
    let enterprising = 0;
    let conventional = 0;

    // Map each answer to its category
    finalAnswers.forEach((answer, index) => {
      const category = riasecQuestions[index].category;
      switch (category) {
        case "realistic":
          realistic += answer;
          break;
        case "investigative":
          investigative += answer;
          break;
        case "artistic":
          artistic += answer;
          break;
        case "social":
          social += answer;
          break;
        case "enterprising":
          enterprising += answer;
          break;
        case "conventional":
          conventional += answer;
          break;
      }
    });

    // Normalize the scores to be out of 100
    const maxPossibleScore = 5 * (riasecQuestions.filter(q => q.category === "realistic").length);
    realistic = Math.round((realistic / maxPossibleScore) * 100);
    investigative = Math.round((investigative / maxPossibleScore) * 100);
    artistic = Math.round((artistic / maxPossibleScore) * 100);
    social = Math.round((social / maxPossibleScore) * 100);
    enterprising = Math.round((enterprising / maxPossibleScore) * 100);
    conventional = Math.round((conventional / maxPossibleScore) * 100);

    // Calculate the personality code (top 3 scores)
    const scores = [
      { code: "R", score: realistic },
      { code: "I", score: investigative },
      { code: "A", score: artistic },
      { code: "S", score: social },
      { code: "E", score: enterprising },
      { code: "C", score: conventional }
    ];
    scores.sort((a, b) => b.score - a.score);
    const personalityCode = `${scores[0].code}${scores[1].code}${scores[2].code}`;

    // Create the results object
    const testResults: RiasecResults = {
      realistic,
      investigative,
      artistic,
      social,
      enterprising,
      conventional,
      personalityCode,
      confidenceScore: 90
    };

    // Set the results
    setResults(testResults);
    
    try {
      // Get AI enhanced analysis
      const aiInsights = await getAIEnhancedAnalysis('riasec', testResults);
      
      // Check if user is logged in before saving
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.id) {
        // Save results to database if user is logged in
        const { error } = await supabase.from('test_results').insert({
          user_id: user.id,
          test_type: 'riasec',
          result_data: {
            ...testResults,
            aiInsights
          }
        });
        
        if (error) {
          console.error('Error saving results:', error);
          toast.error("Impossible d'enregistrer vos résultats.");
        } else {
          toast.success("Test complété avec succès !");
        }
      }
      
      // Mark test as completed and stop loading
      setCompleted(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Error finalizing test:', error);
      toast.error("Une erreur s'est produite lors de l'analyse de vos résultats.");
      setLoading(false);
    }
  };

  // View the test results
  const viewResults = () => {
    if (results) {
      navigate('/test-results', { 
        state: { 
          results,
          testType: 'riasec'
        }
      });
    }
  };

  // Page transitions
  const pageTransitions = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!started && !completed && (
            <motion.div key="intro" {...pageTransitions}>
              <TestDescription
                title="Test d'Orientation RIASEC"
                description="Découvrez vos intérêts professionnels dominants à travers ce test basé sur la théorie des types de personnalité RIASEC de John Holland. Ce test vous aidera à identifier les domaines professionnels qui correspondent le mieux à votre personnalité."
                time="5-10 minutes"
                benefits={[
                  "Identifiez vos intérêts professionnels dominants",
                  "Découvrez des métiers alignés avec votre personnalité",
                  "Obtenez des conseils personnalisés pour votre orientation",
                  "Recevez une analyse approfondie de votre profil RIASEC"
                ]}
                onStart={startTest}
              />
            </motion.div>
          )}

          {started && !completed && (
            <motion.div key="test" {...pageTransitions}>
              <Card className="bg-white/70 backdrop-blur shadow-xl border-primary/10">
                <CardContent className="pt-6 pb-8">
                  <TestHeader 
                    currentQuestion={currentQuestion}
                    totalQuestions={riasecQuestions.length} 
                  />
                  
                  <AnimatePresence mode="wait">
                    <QuestionDisplay
                      currentQuestion={currentQuestion}
                      question={riasecQuestions[currentQuestion]}
                      onAnswer={handleAnswer}
                      loading={loading}
                    />
                  </AnimatePresence>
                  
                  <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0 || loading}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={resetTest}
                      disabled={loading}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Recommencer
                    </Button>
                    
                    {loading && (
                      <Button disabled className="gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Chargement...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {completed && (
            <motion.div key="completion" {...pageTransitions}>
              <TestCompletion
                title="RIASEC"
                onViewResults={viewResults}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
