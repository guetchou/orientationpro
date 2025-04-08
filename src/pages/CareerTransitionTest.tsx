
import { useTestState } from "@/hooks/useTestState";
import TestLayout from "@/components/tests/TestLayout";
import { TestQuestion } from "@/components/tests/TestQuestion";
import { careerTransitionQuestions } from "@/components/tests/career/CareerTransitionQuestions";
import { analyzeCareerTransitionResults } from "@/components/tests/career/CareerTransitionAnalyzer";

export default function CareerTransitionTest() {
  const {
    currentQuestion,
    totalQuestions,
    currentQuestionData,
    isSubmitting,
    handleAnswer
  } = useTestState({
    testType: 'career_transition',
    questions: careerTransitionQuestions,
    analyzeResults: analyzeCareerTransitionResults
  });

  return (
    <TestLayout
      testName="Test de Reconversion Professionnelle"
      accentColor="blue"
      isSubmitting={isSubmitting}
    >
      <TestQuestion
        question={currentQuestionData.question}
        options={currentQuestionData.options}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onAnswer={handleAnswer}
        isSubmitting={isSubmitting}
        accentColor="blue"
      />
    </TestLayout>
  );
}
