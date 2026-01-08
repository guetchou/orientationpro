
import React from 'react';
import { motion } from 'framer-motion';

interface TestHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
}

const TestHeader: React.FC<TestHeaderProps> = ({ currentQuestion, totalQuestions }) => {
  // Calculate the progress percentage
  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold mb-2">Test RIASEC</h2>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">
          Question {currentQuestion + 1} sur {totalQuestions}
        </span>
        <span className="text-sm font-medium">{progressPercentage}% terminé</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </motion.div>
  );
};

export default TestHeader;
