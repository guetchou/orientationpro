
import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface TestQuestionOption {
  value: number;
  text: string;
}

export interface TestQuestionProps {
  question: string;
  category?: string;
  options: TestQuestionOption[];
  currentQuestion: number;
  totalQuestions: number;
  onAnswer: (answer: number) => void;
  isSubmitting: boolean;
  accentColor?: string;
}

export const TestQuestion = ({
  question,
  category,
  options,
  currentQuestion,
  totalQuestions,
  onAnswer,
  isSubmitting,
  accentColor = "blue"
}: TestQuestionProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-xl font-semibold my-4 text-center">
          {question}
        </h2>
        {category && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge 
              variant="outline" 
              className={`bg-${accentColor}-50 dark:bg-${accentColor}-900/20 text-${accentColor}-700 dark:text-${accentColor}-300`}
            >
              {category}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 mb-6">
        <div
          className={`bg-${accentColor}-500 h-2 rounded-full transition-all duration-300 ease-in-out`}
          style={{
            width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        Question {currentQuestion + 1} sur {totalQuestions}
      </div>
      
      <div className="space-y-3">
        {options.map((option, index) => (
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
              className={`w-full text-left justify-start h-auto py-4 px-6 hover:bg-${accentColor}-50 hover:text-${accentColor}-700 dark:hover:bg-${accentColor}-900/30 dark:hover:text-${accentColor}-300 transition-all duration-200`}
            >
              {option.text}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
