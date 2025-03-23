
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuestionDisplayProps } from "./types";
import { LightbulbIcon, CheckCircle2, HelpCircle } from "lucide-react";

// Animation variants
const questionAnimations = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
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
  { score: 1, label: "Pas du tout", color: "border-red-200 hover:bg-red-50 hover:border-red-300", icon: "😕" },
  { score: 2, label: "Un peu", color: "border-orange-200 hover:bg-orange-50 hover:border-orange-300", icon: "🙂" },
  { score: 3, label: "Moyennement", color: "border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300", icon: "😊" },
  { score: 4, label: "Beaucoup", color: "border-green-200 hover:bg-green-50 hover:border-green-300", icon: "😃" },
  { score: 5, label: "Passionnément", color: "border-purple-200 hover:bg-purple-50 hover:border-purple-300", icon: "🤩" }
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
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
    <motion.div 
      className="bg-white p-8 rounded-2xl border-2 border-purple-100 shadow-lg relative overflow-hidden"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-primary-400"></div>
      <div className="flex items-start mb-4">
        <LightbulbIcon className="h-7 w-7 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-xl font-medium text-gray-800 leading-relaxed">
          {question}
        </p>
      </div>
      <div className="flex justify-end">
        <div className="text-xs text-gray-500 italic flex items-center">
          <HelpCircle className="h-3 w-3 mr-1" />
          Choisissez l'option qui vous correspond le mieux
        </div>
      </div>
    </motion.div>
  );
};

// Options grid component
interface OptionsGridProps {
  options: Array<{ score: number, label: string, color: string, icon: string }>;
  onAnswer: (score: number) => void;
  loading: boolean;
}

const OptionsGrid = ({ options, onAnswer, loading }: OptionsGridProps) => {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <motion.div
          key={option.score}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: option.score * 0.1 }}
          className="transform transition-all duration-200 hover:scale-[1.02]"
        >
          <Button
            onClick={() => onAnswer(option.score)}
            variant="outline"
            className={`w-full py-5 justify-between px-6 bg-white/80 backdrop-blur-sm transition-all duration-300 border-2 ${option.color} hover:shadow-md ${
              option.score === 5 
                ? "border-purple-400 shadow-purple-100" 
                : ""
            }`}
            disabled={loading}
          >
            <OptionContent score={option.score} label={option.label} icon={option.icon} />
            {option.score === 5 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <CheckCircle2 className="h-5 w-5 text-purple-500" />
              </motion.div>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

// Option content component
const OptionContent = ({ score, label, icon }: { score: number, label: string, icon: string }) => {
  return (
    <div className="flex items-center">
      <div className={`h-10 w-10 flex items-center justify-center rounded-full mr-4 bg-white shadow-sm text-xl ${
        score === 5
          ? "ring-2 ring-purple-300 ring-offset-2"
          : "border border-gray-200"
      }`}>
        {icon}
      </div>
      <span className={`text-lg ${score === 5 ? "font-semibold text-purple-700" : "text-gray-700"}`}>
        {label}
      </span>
    </div>
  );
};
