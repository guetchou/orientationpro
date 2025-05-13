
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isLoading } = useAuth(); // Changé de loading à isLoading
  const location = useLocation();
  const { warning } = useToast();
  
  useEffect(() => {
    if (!isLoading && !user) { // Changé de loading à isLoading
      warning("Connexion requise pour accéder à cette page");
    }
  }, [isLoading, user, warning]); // Changé de loading à isLoading

  // If still loading, show a loading indicator
  if (isLoading) { // Changé de loading à isLoading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50/50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-secondary animate-spin"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600">Chargement de votre profil...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default RequireAuth;
