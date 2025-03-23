
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Info, Clock, Award, ArrowRight } from 'lucide-react';
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
        <motion.h1 
          className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {title}
        </motion.h1>
        <motion.div 
          className="h-1 w-24 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mx-auto mb-6"
          initial={{ width: 0 }}
          animate={{ width: '6rem' }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
      </div>

      <Card className="border-2 border-primary/10 overflow-hidden backdrop-blur-sm bg-white/80">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-white/10 pointer-events-none" />
        
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            À propos de ce test
          </CardTitle>
          <CardDescription className="text-base">
            Découvrez comment ce test peut vous aider dans votre orientation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <p className="mb-6 text-gray-700 leading-relaxed">{description}</p>
          
          <div className="flex items-center mb-6 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
            <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{time}</span>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center mb-4 text-primary">
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
                  <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3 mt-0.5">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
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
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-90 rounded-xl" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAzMmM4Ljg0IDAgMTYgNy4xNiAxNiAxNiAwLTguODQgNy4xNi0xNiAxNi0xNi04Ljg0IDAtMTYtNy4xNi0xNi0xNiAwIDguODQtNy4xNiAxNi0xNiAxNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-30" />
            
            <Button 
              onClick={onStart} 
              className="w-full bg-transparent border-0 text-white shadow-none py-6 relative z-10"
            >
              <span className="text-lg font-semibold mr-2">Commencer le test</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
