
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
        options={currentQuestionData.options}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onAnswer={handleAnswer}
        isSubmitting={isSubmitting}
        accentColor="amber"
      />
    </TestLayout>
  );
}
