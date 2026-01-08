
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface RiasecQuestionProps {
  question: {
    id: number;
    text: string;
    category: string;
  };
  onAnswer: (score: number) => void;
  loading: boolean;
}

export const RiasecQuestion = ({ question, onAnswer, loading }: RiasecQuestionProps) => {
  const handleScore = (score: number) => {
    if (!loading) {
      onAnswer(score);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-medium text-center text-gray-800">
        {question.text}
      </h2>

      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        {[1, 2, 3, 4, 5].map((score) => (
          <Button
            key={score}
            onClick={() => handleScore(score)}
            disabled={loading}
            variant={score === 3 ? "default" : score < 3 ? "outline" : "secondary"}
            className="flex flex-col py-4 h-auto transition-all"
          >
            <span className="text-lg font-bold mb-1">{score}</span>
            <span className="text-xs hidden sm:inline">
              {score === 1 && "Pas du tout"}
              {score === 2 && "Un peu"}
              {score === 3 && "Moyennement"}
              {score === 4 && "Beaucoup"}
              {score === 5 && "Totalement"}
            </span>
          </Button>
        ))}
      </div>

      <div className="flex justify-between text-sm text-gray-500 px-2">
        <span>Pas du tout d'accord</span>
        <span>Tout à fait d'accord</span>
      </div>
    </motion.div>
  );
};
