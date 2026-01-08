
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trophy, Sparkles } from 'lucide-react';

interface TestCompletionProps {
  title: string;
  onViewResults: () => void;
}

export const TestCompletion: React.FC<TestCompletionProps> = ({
  title,
  onViewResults
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-indigo-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Test Terminé !</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Félicitations ! Vous avez complété le test "{title}".
          </p>
          
          <div className="flex flex-col space-y-3 w-full max-w-xs">
            <Button 
              onClick={onViewResults}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Voir Mes Résultats
            </Button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            Vos réponses ont été enregistrées
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
