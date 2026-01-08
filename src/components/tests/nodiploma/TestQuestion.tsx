
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { TestQuestion as QuestionType } from "./TestQuestions";

interface Option {
  value: number;
  label: string;
}

interface TestQuestionProps {
  currentQuestion: QuestionType;
  totalQuestions: number;
  currentQuestionIndex: number;
  onAnswer: (value: number) => void;
  isSubmitting: boolean;
}

export const TestQuestion = ({
  currentQuestion,
  totalQuestions,
  currentQuestionIndex,
  onAnswer,
  isSubmitting
}: TestQuestionProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-xl font-semibold my-4 text-center">
          {currentQuestion.question}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-3">
          {currentQuestion.category}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
            {currentQuestion.category}
          </Badge>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 mb-6">
        <div
          className="bg-teal-500 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        Question {currentQuestionIndex + 1} sur {totalQuestions}
      </div>
      
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={() => onAnswer(option.value)}
              variant="outline"
              disabled={isSubmitting}
              className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 transition-all duration-200"
            >
              {option.label}
            </Button>
          </motion.div>
        ))}
      </div>

      {isSubmitting && (
        <div className="flex justify-center mt-6">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
          <span className="ml-2 text-teal-600 dark:text-teal-400">Analyse en cours...</span>
        </div>
      )}
    </div>
  );
};
