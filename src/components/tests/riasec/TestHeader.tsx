
import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface TestHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const TestHeader = ({ currentQuestion, totalQuestions }: TestHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-2xl font-bold text-center mb-2 text-primary">
        Test d'orientation RIASEC
      </h1>
      <div className="flex items-center justify-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-primary/60" />
        <p className="text-gray-600 text-center">
          Question {currentQuestion + 1} sur {totalQuestions}
        </p>
      </div>
      
      <motion.div 
        className="w-full bg-gray-200 h-2 rounded-full mt-4"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-primary h-2 rounded-full transition-all"
          style={{
            width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </div>
  );
};
