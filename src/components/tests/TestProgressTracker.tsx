
import React from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface TestProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  testName: string;
  showPercentage?: boolean;
  className?: string;
  color?: string;
}

const TestProgressTracker = ({
  currentStep,
  totalSteps,
  testName,
  showPercentage = true,
  className = "",
  color = "blue"
}: TestProgressTrackerProps) => {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  
  const getProgressColor = () => {
    switch (color) {
      case "green": return "bg-green-500";
      case "purple": return "bg-purple-500";
      case "pink": return "bg-pink-500";
      case "indigo": return "bg-indigo-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
        <span>{testName}</span>
        {showPercentage && (
          <motion.span
            key={progressPercentage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-medium"
          >
            {progressPercentage}%
          </motion.span>
        )}
      </div>
      
      <div className="relative">
        <Progress
          value={progressPercentage}
          className={`h-2 rounded-full bg-gray-200 dark:bg-gray-700`}
        />
        <div className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor()}`} style={{ width: `${progressPercentage}%` }} />
        
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-500 px-1">
          <span>Question {currentStep} / {totalSteps}</span>
          {currentStep === totalSteps ? (
            <motion.span
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1] }}
              transition={{ repeat: 3, duration: 0.5 }}
              className="text-green-500 font-medium"
            >
              Terminé!
            </motion.span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TestProgressTracker;
