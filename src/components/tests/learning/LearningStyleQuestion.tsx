
import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LearningStyleOption } from './LearningStyleQuestions';

interface LearningStyleQuestionProps {
  question: string;
  options: LearningStyleOption[];
  onAnswer: (value: number) => void;
  isSubmitting: boolean;
}

const LearningStyleQuestion = ({ question, options, onAnswer, isSubmitting }: LearningStyleQuestionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <p className="text-lg mb-4">{question}</p>
      
      <div className="space-y-4">
        {options.map((option, index) => (
          <Button
            key={index}
            onClick={() => onAnswer(option.value)}
            variant="outline"
            disabled={isSubmitting}
            className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300 transition-all duration-200"
          >
            {option.text}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default LearningStyleQuestion;
