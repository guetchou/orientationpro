
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
  // Options array with score and labels
  const options = [
    { score: 1, label: "Pas du tout", color: "bg-red-50 hover:bg-red-100 border-red-200" },
    { score: 2, label: "Un peu", color: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { score: 3, label: "Moyennement", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
    { score: 4, label: "Beaucoup", color: "bg-green-50 hover:bg-green-100 border-green-200" },
    { score: 5, label: "Passionnément", color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" }
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-sm mb-8">
          <p className="text-xl text-center font-medium text-gray-800">
            {question.question}
          </p>
        </div>

        <div className="grid gap-3">
          {options.map((option) => (
            <motion.div
              key={option.score}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: option.score * 0.1 }}
              className="transform transition-all duration-200 hover:scale-[1.01]"
            >
              <Button
                onClick={() => onAnswer(option.score)}
                variant="outline"
                className={`w-full py-6 justify-start px-6 ${option.color} backdrop-blur-sm transition-all duration-300 border-2 hover:shadow-md ${
                  option.score === 5 
                    ? "border-primary/30 shadow-primary/20" 
                    : ""
                }`}
                disabled={loading}
              >
                <div className="flex items-center w-full">
                  <div className={`h-8 w-8 flex items-center justify-center rounded-full mr-4 bg-white shadow-sm ${
                    option.score === 5
                      ? "text-primary font-bold"
                      : "text-gray-600"
                  }`}>
                    {option.score}
                  </div>
                  <span className={`text-lg ${option.score === 5 ? "font-medium" : ""}`}>
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
