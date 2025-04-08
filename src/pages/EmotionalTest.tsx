
import { useTestState } from "@/hooks/useTestState";
import TestLayout from "@/components/tests/TestLayout";
import { TestQuestion } from "@/components/tests/TestQuestion";
import { emotionalQuestions } from "@/components/tests/emotional/EmotionalQuestions";
import { analyzeEmotionalResults } from "@/components/tests/emotional/EmotionalTestAnalyzer";

export default function EmotionalTest() {
  const {
    currentQuestion,
    totalQuestions,
    currentQuestionData,
    isSubmitting,
    handleAnswer
  } = useTestState({
    testType: 'emotional',
    questions: emotionalQuestions,
    analyzeResults: analyzeEmotionalResults
  });

  return (
    <TestLayout
      testName="Test d'Intelligence Émotionnelle"
      accentColor="pink"
      isSubmitting={isSubmitting}
    >
      <TestQuestion
        question={currentQuestionData.question}
        options={currentQuestionData.options}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onAnswer={handleAnswer}
        isSubmitting={isSubmitting}
        accentColor="pink"
      />
    </TestLayout>
  );
}
