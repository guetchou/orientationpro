
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, RotateCcw } from "lucide-react";
import { TestHeader } from "@/components/tests/riasec/TestHeader";
import { TestDescription } from "@/components/tests/TestDescription";
import { TestCompletion } from "@/components/tests/TestCompletion";
import { QuestionDisplay } from "@/components/tests/riasec/QuestionDisplay";
import { useRiasecTest } from "@/hooks/useRiasecTest";
import { RiasecQuestionData } from "@/components/tests/riasec/types";

// Import the RIASEC questions
const riasecQuestions: RiasecQuestionData[] = [
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
  const {
    started,
    completed,
    currentQuestion,
    loading,
    resetTest,
    startTest,
    handleAnswer,
    handlePrevious,
    viewResults
  } = useRiasecTest();

  // Page transitions
  const pageTransitions = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  // Handle question answer with current question data
  const onAnswerQuestion = (score: number) => {
    handleAnswer(score, riasecQuestions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!started && !completed && (
            <RiasecTestIntro startTest={startTest} />
          )}

          {started && !completed && (
            <RiasecTestQuestions
              currentQuestion={currentQuestion}
              totalQuestions={riasecQuestions.length}
              question={riasecQuestions[currentQuestion]}
              onAnswer={onAnswerQuestion}
              handlePrevious={handlePrevious}
              resetTest={resetTest}
              loading={loading}
            />
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

// Test Introduction Component
const RiasecTestIntro = ({ startTest }: { startTest: () => void }) => {
  return (
    <motion.div 
      key="intro" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
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
  );
};

// Test Questions Component
interface RiasecTestQuestionsProps {
  currentQuestion: number;
  totalQuestions: number;
  question: RiasecQuestionData;
  onAnswer: (score: number) => void;
  handlePrevious: () => void;
  resetTest: () => void;
  loading: boolean;
}

const RiasecTestQuestions = ({
  currentQuestion,
  totalQuestions,
  question,
  onAnswer,
  handlePrevious,
  resetTest,
  loading
}: RiasecTestQuestionsProps) => {
  return (
    <motion.div
      key="test"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-white/70 backdrop-blur shadow-xl border-primary/10">
        <CardContent className="pt-6 pb-8">
          <TestHeader 
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions} 
          />
          
          <AnimatePresence mode="wait">
            <QuestionDisplay
              currentQuestion={currentQuestion}
              question={question}
              onAnswer={onAnswer}
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
  );
};
