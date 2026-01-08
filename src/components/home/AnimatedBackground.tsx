
import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-70"></div>
      <div className="absolute inset-0 backdrop-blur-[150px]"></div>
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-30"></div>
      
      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 20,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-[120px] opacity-50"
      />
      <motion.div 
        animate={{ 
          x: [0, -70, 0],
          y: [0, 50],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 25,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-secondary/20 rounded-full filter blur-[100px] opacity-40"
      />
      <motion.div 
        animate={{ 
          x: [0, 40, 0],
          y: [0, -60],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 30,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute top-2/3 right-1/4 w-64 h-64 bg-purple/20 rounded-full filter blur-[80px] opacity-30"
      />
    </div>
  );
};

export default AnimatedBackground;
