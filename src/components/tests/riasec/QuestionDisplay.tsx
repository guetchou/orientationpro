
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuestionDisplayProps } from "./types";

// Animation variants
const questionAnimations = {
  container: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4 }
  },
  option: (index: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: index * 0.1 }
  })
};

// Option structure for readability
const options = [
  { score: 1, label: "Pas du tout", color: "bg-red-50 hover:bg-red-100 border-red-200" },
  { score: 2, label: "Un peu", color: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  { score: 3, label: "Moyennement", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
  { score: 4, label: "Beaucoup", color: "bg-green-50 hover:bg-green-100 border-green-200" },
  { score: 5, label: "Passionnément", color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" }
];

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
        className="space-y-6"
        {...questionAnimations.container}
      >
        <QuestionCard question={question.question} />
        <OptionsGrid 
          options={options} 
          onAnswer={onAnswer} 
          loading={loading} 
        />
      </motion.div>
    </AnimatePresence>
  );
};

// Question card component
const QuestionCard = ({ question }: { question: string }) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-sm mb-8">
      <p className="text-xl text-center font-medium text-gray-800">
        {question}
      </p>
    </div>
  );
};

// Options grid component
interface OptionsGridProps {
  options: Array<{ score: number, label: string, color: string }>;
  onAnswer: (score: number) => void;
  loading: boolean;
}

const OptionsGrid = ({ options, onAnswer, loading }: OptionsGridProps) => {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <motion.div
          key={option.score}
          {...questionAnimations.option(option.score)}
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
            <OptionContent score={option.score} label={option.label} />
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

// Option content component
const OptionContent = ({ score, label }: { score: number, label: string }) => {
  return (
    <div className="flex items-center w-full">
      <div className={`h-8 w-8 flex items-center justify-center rounded-full mr-4 bg-white shadow-sm ${
        score === 5
          ? "text-primary font-bold"
          : "text-gray-600"
      }`}>
        {score}
      </div>
      <span className={`text-lg ${score === 5 ? "font-medium" : ""}`}>
        {label}
      </span>
    </div>
  );
};
