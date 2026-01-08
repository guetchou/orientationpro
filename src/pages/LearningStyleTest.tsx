
import { useTestState } from "@/hooks/useTestState";
import TestLayout from "@/components/tests/TestLayout";
import { TestQuestion } from "@/components/tests/TestQuestion";
import { learningStyleQuestions } from "@/components/tests/learning/LearningStyleQuestions";
import { analyzeLearningStyleResults } from "@/components/tests/learning/LearningStyleAnalyzer";
import TestFAQ from "@/components/tests/TestFAQ";
import { learningStyleFAQs } from "@/components/tests/learning/LearningStyleFAQ";

export default function LearningStyleTest() {
  const {
    currentQuestion,
    totalQuestions,
    currentQuestionData,
    isSubmitting,
    handleAnswer
  } = useTestState({
    testType: 'learning_style',
    questions: learningStyleQuestions,
    analyzeResults: analyzeLearningStyleResults
  });

  return (
    <TestLayout
      testName="Test de Styles d'Apprentissage"
      accentColor="green"
      isSubmitting={isSubmitting}
    >
      <TestQuestion
        question={currentQuestionData.question}
        options={currentQuestionData.options}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onAnswer={handleAnswer}
        isSubmitting={isSubmitting}
        accentColor="green"
      />
      
      {/* FAQ Section - outside the card */}
      <div className="mt-12">
        <TestFAQ testType="de Styles d'Apprentissage" faqs={learningStyleFAQs} />
      </div>
    </TestLayout>
  );
}
