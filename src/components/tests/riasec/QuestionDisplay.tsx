
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface QuestionDisplayProps {
  currentQuestion: number;
  question: {
    question: string;
    category: string;
  };
  onAnswer: (score: number) => void;
  loading: boolean;
}

export const QuestionDisplay = ({ 
  currentQuestion, 
  question, 
  onAnswer, 
  loading 
}: QuestionDisplayProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <p className="text-lg text-center mb-8 font-medium text-gray-800">
          {question.question}
        </p>

        <div className="grid gap-3">
          {[
            { score: 1, label: "Pas du tout" },
            { score: 2, label: "Un peu" },
            { score: 3, label: "Moyennement" },
            { score: 4, label: "Beaucoup" },
            { score: 5, label: "Passionnément" }
          ].map((option) => (
            <motion.div
              key={option.score}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: option.score * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--primary), 0.05)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => onAnswer(option.score)}
                variant={option.score === 5 ? "default" : "outline"}
                className={`w-full py-6 justify-start px-6 ${
                  option.score === 5 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:border-primary/30 hover:text-primary"
                }`}
                disabled={loading}
              >
                <div className="flex items-center">
                  <div className={`h-6 w-6 flex items-center justify-center rounded-full mr-3 border-2 ${
                    option.score === 5
                      ? "border-white/30 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}>
                    {option.score}
                  </div>
                  <span className={option.score === 5 ? "text-white" : ""}>
                    {option.label}
                  </span>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
