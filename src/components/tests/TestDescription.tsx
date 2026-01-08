
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Info, Clock, Award, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TestDescriptionProps {
  title: string;
  description: string;
  time: string;
  benefits: string[];
  onStart: () => void;
}

export const TestDescription: React.FC<TestDescriptionProps> = ({
  title,
  description,
  time,
  benefits,
  onStart
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto mb-8"
    >
      <div className="text-center mb-10">
        <motion.div
          className="inline-block mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, 0] }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {title}
        </motion.h1>
        <motion.div 
          className="h-1 w-24 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full mx-auto mb-6"
          initial={{ width: 0 }}
          animate={{ width: '6rem' }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
      </div>

      <Card className="border-0 overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/20 dark:to-purple-900/20 pointer-events-none" />
        
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-2xl flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Info className="h-5 w-5" />
            À propos de ce test
          </CardTitle>
          <CardDescription className="text-base">
            Découvrez comment ce test peut vous aider dans votre orientation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
          
          <div className="flex items-center mb-6 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
            <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{time}</span>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Award className="h-5 w-5 mr-2" />
              <span className="font-medium text-lg">Bénéfices du test:</span>
            </div>
            <ul className="space-y-3 pl-0">
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index + 0.5 }}
                  className="flex items-start"
                >
                  <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3 mt-0.5">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90 rounded-xl" />
            <div className="absolute inset-0 opacity-30 rounded-xl" 
                 style={{ backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%)",
                          backgroundSize: "100px 100px" }} />
            
            <Button 
              onClick={onStart} 
              className="w-full bg-transparent border-0 text-white shadow-none py-6 relative z-10"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              <span className="text-lg font-semibold mr-2">Commencer le test</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
