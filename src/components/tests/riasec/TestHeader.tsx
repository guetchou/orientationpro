
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
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
      <motion.h1 
        className="font-heading text-4xl font-bold text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-primary-500"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Test d'orientation RIASEC
      </motion.h1>
      
      {/* Question Counter */}
      <motion.div 
        className="flex items-center justify-center gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BookOpen className="h-5 w-5 text-purple-500" />
        <p className="text-gray-700 text-center flex items-center font-medium">
          Question <span className="font-bold mx-1 text-purple-600">{currentQuestion + 1}</span> sur <span className="font-bold mx-1 text-purple-600">{totalQuestions}</span>
          <ChevronRight className="h-4 w-4 ml-1 text-purple-500" />
        </p>
      </motion.div>
      
      {/* Progress Bar */}
      <ProgressBar progress={progress} />
    </div>
  );
};

// Separate progress bar component
const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <>
      <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden mt-6 shadow-inner">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-primary-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-600 font-medium">
        <span>Début</span>
        <span className="bg-purple-100 px-3 py-1 rounded-full text-purple-700 font-bold">
          Progression: {Math.round(progress)}%
        </span>
        <span>Fin</span>
      </div>
    </>
  );
};
