
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogIn, BarChart3, User } from 'lucide-react';
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
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 text-center"
    >
      <Card className="bg-gradient-to-b from-white to-green-50 border-2 border-green-100">
        <CardContent className="pt-8 pb-6">
          <motion.div 
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>

          <motion.h1 
            className="font-heading text-2xl font-bold mb-2 text-green-700"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Test {title} complété avec succès !
          </motion.h1>

          <motion.p 
            className="text-gray-600 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Votre profil a été analysé par notre IA avancée. Pour sauvegarder et consulter vos résultats détaillés, vous devez être connecté.
          </motion.p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button 
                onClick={onViewResults}
                className="w-full md:w-auto px-6 py-5 bg-gradient-to-r from-primary to-primary/80"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Voir mes résultats
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto px-6 py-5 border-2 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Me connecter
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <Link to="/register">
                <Button 
                  variant="ghost" 
                  className="w-full md:w-auto px-6 py-5 hover:bg-primary/5"
                >
                  <User className="mr-2 h-5 w-5" />
                  Créer un compte
                </Button>
              </Link>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
