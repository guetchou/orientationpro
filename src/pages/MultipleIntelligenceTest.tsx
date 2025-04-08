
import { useTestState } from "@/hooks/useTestState";
import TestLayout from "@/components/tests/TestLayout";
import { TestQuestion } from "@/components/tests/TestQuestion";
import { intelligenceQuestions } from "@/components/tests/intelligence/IntelligenceQuestions";
import { analyzeMultipleIntelligence } from "@/components/tests/intelligence/IntelligenceAnalyzer";
import TestFAQ from "@/components/tests/TestFAQ";
import { intelligenceFAQs } from "@/components/tests/intelligence/IntelligenceFAQ";

export default function MultipleIntelligenceTest() {
  const {
    currentQuestion,
    totalQuestions,
    currentQuestionData,
    isSubmitting,
    handleAnswer
  } = useTestState({
    testType: 'multiple_intelligence',
    questions: intelligenceQuestions,
    analyzeResults: analyzeMultipleIntelligence
  });

  // Map string options to numbered options for our component
  const mappedOptions = currentQuestionData.options.map((option, index) => ({
    value: index,
    text: option
  }));

  return (
    <TestLayout
      testName="Test des Intelligences Multiples"
      accentColor="purple"
      isSubmitting={isSubmitting}
    >
      <TestQuestion
        question={currentQuestionData.question}
        options={mappedOptions}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onAnswer={(index) => handleAnswer(currentQuestionData.options[index])}
        isSubmitting={isSubmitting}
        accentColor="purple"
      />
      
      {/* FAQ Section - outside the card */}
      <div className="mt-12">
        <TestFAQ testType="des Intelligences Multiples" faqs={intelligenceFAQs} />
      </div>
    </TestLayout>
  );
}
