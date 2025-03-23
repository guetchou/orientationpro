
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogIn, BarChart3, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto p-6 text-center"
    >
      <Card className="relative overflow-hidden border-2 border-green-100">
        <div className="absolute inset-0 bg-gradient-to-tr from-green-50 via-white to-blue-50 opacity-70" />
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: "radial-gradient(circle at 25px 25px, rgba(0, 255, 0, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 255, 0, 0.15) 2%, transparent 0%)",
               backgroundSize: "100px 100px" 
             }} />
        
        <CardContent className="relative z-10 pt-10 pb-8">
          <motion.div 
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div
            className="mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Sparkles className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <h1 className="font-heading text-3xl font-bold mb-2 text-gradient bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              Félicitations !
            </h1>
          </motion.div>

          <motion.h2 
            className="text-xl font-medium mb-2 text-gray-800"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            Test {title} complété avec succès
          </motion.h2>

          <motion.p 
            className="text-gray-600 mb-10 max-w-md mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            Votre profil a été analysé par notre IA avancée. Pour sauvegarder et consulter vos résultats détaillés, vous devez être connecté.
          </motion.p>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="relative overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-90 rounded-xl" />
              <Button 
                onClick={onViewResults}
                className="w-full h-auto py-4 bg-transparent border-0 relative z-10 text-white"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                <span className="font-medium">Voir mes résultats</span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <Link to="/login" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-auto py-4 border-2 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <LogIn className="mr-3 h-5 w-5" />
                  <span className="font-medium">Me connecter</span>
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-4"
          >
            <Link to="/register" className="inline-block">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-primary hover:bg-primary/5 mt-3"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Créer un compte gratuit</span>
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
