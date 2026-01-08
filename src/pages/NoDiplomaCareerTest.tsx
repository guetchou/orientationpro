
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import TestLayout from "@/components/tests/TestLayout";
import { TestQuestion } from "@/components/tests/TestQuestion";
import { careerTestQuestions } from "@/components/tests/nodiploma/TestQuestions";
import { analyzeNoDiplomaCareerResults } from "@/components/tests/nodiploma/ResultsAnalyzer";
import { useTestState } from "@/hooks/useTestState";

export default function NoDiplomaCareerTest() {
  const { 
    currentQuestion,
    totalQuestions,
    currentQuestionData,
    isSubmitting,
    handleAnswer
  } = useTestState({
    testType: 'no_diploma_career',
    questions: careerTestQuestions,
    analyzeResults: analyzeNoDiplomaCareerResults
  });

  return (
    <TestLayout 
      testName="Test d'Orientation Sans Diplôme"
      accentColor="teal"
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
        accentColor="teal"
      />
    </TestLayout>
  );
}
