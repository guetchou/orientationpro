
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";

interface TestHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const TestHeader = ({ currentQuestion, totalQuestions }: TestHeaderProps) => {
  // Calculate progress percentage
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  return (
    <div className="mb-12">
      <motion.h1 
        className="font-heading text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Test d'orientation RIASEC
      </motion.h1>
      
      <motion.div 
        className="flex items-center justify-center gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BookOpen className="h-5 w-5 text-primary/60" />
        <p className="text-gray-600 text-center flex items-center">
          Question <span className="font-medium mx-1">{currentQuestion + 1}</span> sur <span className="font-medium mx-1">{totalQuestions}</span>
          <ChevronRight className="h-4 w-4 ml-1 text-primary/60" />
        </p>
      </motion.div>
      
      <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mt-4 shadow-inner">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: [`${progress}%`, `${progress + 10}%`, `${progress}%`],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatType: "mirror"
          }}
          style={{ width: `${progress/3}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Début</span>
        <span>Progression: {Math.round(progress)}%</span>
        <span>Fin</span>
      </div>
    </div>
  );
};
