
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-md w-full mx-auto text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block p-6 bg-white rounded-full mb-6 shadow-md"
        >
          <FileQuestion className="h-16 w-16 text-primary" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-2 text-gray-900"
        >
          Page non trouvée
        </motion.h1>
        
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-gray-600 mb-8"
        >
          La page que vous recherchez n'existe pas ou a été déplacée.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-4"
        >
          <Button asChild size="lg" className="w-full sm:w-auto px-8 gap-2">
            <Link to="/">
              <ArrowLeft size={18} />
              Retour à l'accueil
            </Link>
          </Button>
          
          <div>
            <Button variant="outline" asChild className="w-full sm:w-auto gap-2">
              <Link to="/contact" className="text-primary">
                <MessageCircle size={18} />
                Contactez-nous si vous avez besoin d'aide
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;
