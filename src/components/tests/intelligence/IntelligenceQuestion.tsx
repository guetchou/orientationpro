
import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface IntelligenceQuestionProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  isSubmitting: boolean;
}

const IntelligenceQuestion = ({ question, options, onAnswer, isSubmitting }: IntelligenceQuestionProps) => {
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
            onClick={() => onAnswer(option)}
            variant="outline"
            disabled={isSubmitting}
            className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-300 transition-all duration-200"
          >
            {option}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default IntelligenceQuestion;
