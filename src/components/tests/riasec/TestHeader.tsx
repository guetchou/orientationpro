
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Award } from "lucide-react";
import { TestHeaderProps } from "./types";

// Animation variants
const headerAnimations = {
  title: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  subtitle: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, delay: 0.2 }
  }
};

export const TestHeader = ({ currentQuestion, totalQuestions }: TestHeaderProps) => {
  // Calculate progress percentage
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  return (
    <div className="mb-10">
      {/* Test Title */}
      <div className="flex items-center justify-center mb-3 gap-2">
        <Award className="h-7 w-7 text-indigo-500" />
        <motion.h1 
          className="font-heading text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Test d'orientation RIASEC
        </motion.h1>
      </div>
      
      {/* Question Counter */}
      <motion.div 
        className="flex items-center justify-center gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BookOpen className="h-5 w-5 text-indigo-500" />
        <p className="text-gray-700 dark:text-gray-300 text-center flex items-center font-medium">
          Question <span className="font-bold mx-1 text-indigo-600 dark:text-indigo-400">{currentQuestion + 1}</span> sur <span className="font-bold mx-1 text-indigo-600 dark:text-indigo-400">{totalQuestions}</span>
          <ChevronRight className="h-4 w-4 ml-1 text-indigo-500" />
        </p>
      </motion.div>
      
      {/* Progress Bar */}
      <ProgressBar progress={progress} currentQuestion={currentQuestion} totalQuestions={totalQuestions} />
    </div>
  );
};

// Separate progress bar component
const ProgressBar = ({ 
  progress, 
  currentQuestion, 
  totalQuestions 
}: { 
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
}) => {
  return (
    <>
      <div className="relative w-full h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-6 shadow-inner group">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            x: ["0%", "100%"]
          }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut", 
            repeat: Infinity
          }}
        />
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
        <span>Début</span>
        <span className="bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 rounded-full text-indigo-700 dark:text-indigo-300 font-bold">
          {currentQuestion + 1} sur {totalQuestions}
        </span>
        <span>Fin</span>
      </div>
    </>
  );
};
