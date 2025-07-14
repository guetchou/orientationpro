import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, RotateCcw, Home, ArrowLeft } from "lucide-react";
import TestHeader from "@/components/tests/riasec/TestHeader";
import { TestDescription } from "@/components/tests/TestDescription";
import { TestCompletion } from "@/components/tests/TestCompletion";
import { QuestionDisplay } from "@/components/tests/riasec/QuestionDisplay";
import { useRiasecTest } from "@/hooks/useRiasecTest";
import { RiasecQuestionData } from "@/components/tests/riasec/types";
import { riasecQuestions } from "@/data/questions";
import { pageTransitions } from "@/animations/transitions";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTestState } from "@/hooks/useTestState";
import TestLayout from "@/components/tests/TestLayout";
import { TestQuestion } from "@/components/tests/TestQuestion";
import { entrepreneurialQuestions } from "@/components/tests/entrepreneurial/EntrepreneurialQuestions";
import { analyzeEntrepreneurialResults } from "@/components/tests/entrepreneurial/EntrepreneurialAnalyzer";

export default function EntrepreneurialTest() {
  const {
    currentQuestion,
    totalQuestions,
    currentQuestionData,
    isSubmitting,
    handleAnswer
  } = useTestState({
    testType: 'entrepreneurial',
    questions: entrepreneurialQuestions,
    analyzeResults: analyzeEntrepreneurialResults
  });

  return (
    <TestLayout 
      testName="Test d'Aptitude Entrepreneuriale"
      accentColor="amber"
      isSubmitting={isSubmitting}
    >
      <TestQuestion
        question={currentQuestionData.question}
        category={currentQuestionData.category}
        options={currentQuestionData.options.map(option => ({
          value: option.value,
          text: option.label
        }))}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onAnswer={handleAnswer}
        isSubmitting={isSubmitting}
        accentColor="amber"
      />
    </TestLayout>
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
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-indigo-500/5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
      <CardContent className="pt-8 pb-8 relative z-10">
        <TestHeader currentQuestion={currentQuestion} totalQuestions={totalQuestions} />
        <AnimatePresence mode="wait">
          <QuestionDisplay currentQuestion={currentQuestion} question={question} onAnswer={onAnswer} loading={loading} />
        </AnimatePresence>
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0 || loading} className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/30">
            <ChevronLeft className="h-4 w-4" /> Précédent
          </Button>
          <Button variant="outline" onClick={resetTest} disabled={loading} className="gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
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
