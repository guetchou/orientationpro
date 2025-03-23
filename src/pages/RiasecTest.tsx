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
import { riasecQuestions } from "@/data/questions";
import { pageTransitions } from "@/animations/transitions";

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

  const onAnswerQuestion = (score: number) => handleAnswer(score, riasecQuestions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-700 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!started && !completed && <RiasecTestIntro startTest={startTest} />}
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
              <TestCompletion title="RIASEC" onViewResults={viewResults} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const RiasecTestIntro = ({ startTest }: { startTest: () => void }) => (
  <motion.div key="intro" {...pageTransitions}>
    <TestDescription
      title="Test d'Orientation RIASEC"
      description="Découvrez vos intérêts professionnels dominants à travers ce test basé sur la théorie des types de personnalité RIASEC de John Holland."
      time="5-10 minutes"
      benefits={["Identifiez vos intérêts professionnels", "Découvrez des métiers alignés avec votre personnalité"]}
      onStart={startTest}
    />
  </motion.div>
);

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
}: RiasecTestQuestionsProps) => (
  <motion.div key="test" {...pageTransitions}>
    <Card className="bg-white/70 dark:bg-gray-800 backdrop-blur-xl shadow-xl border-gray-200 dark:border-gray-600">
      <CardContent className="pt-6 pb-8">
        <TestHeader currentQuestion={currentQuestion} totalQuestions={totalQuestions} />
        <AnimatePresence mode="wait">
          <QuestionDisplay currentQuestion={currentQuestion} question={question} onAnswer={onAnswer} loading={loading} />
        </AnimatePresence>
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0 || loading} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Précédent
          </Button>
          <Button variant="outline" onClick={resetTest} disabled={loading} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Recommencer
          </Button>
          {loading && (
            <Button disabled className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
