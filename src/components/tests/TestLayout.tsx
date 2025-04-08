
import React, { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/transitions";
import { Loader2 } from "lucide-react";
import TestBreadcrumb from "@/components/tests/TestBreadcrumb";

interface TestLayoutProps {
  children: ReactNode;
  testName: string;
  accentColor: string;
  isSubmitting?: boolean;
  loadingMessage?: string;
}

const TestLayout = ({ 
  children, 
  testName, 
  accentColor, 
  isSubmitting = false,
  loadingMessage = "Analyse en cours..." 
}: TestLayoutProps) => {
  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-br from-${accentColor}-50 to-${accentColor === 'blue' ? 'sky' : accentColor}-50 dark:from-gray-900 dark:to-${accentColor}-900 py-12 px-4`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <TestBreadcrumb testName={testName} color={accentColor} />
        </div>

        <h1 className={`text-3xl font-bold text-center mb-8 text-${accentColor}-800 dark:text-${accentColor}-300`}>
          {testName}
        </h1>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative max-w-2xl mx-auto">
          <div className={`absolute inset-0 bg-gradient-to-tr from-${accentColor}-500/5 via-transparent to-${accentColor === 'blue' ? 'sky' : accentColor}-500/5`}></div>
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${accentColor}-500 to-${accentColor === 'blue' ? 'sky' : accentColor}-500`}></div>
          <CardContent className="p-6 relative z-10">
            {children}
            
            {isSubmitting && (
              <div className="flex justify-center mt-6">
                <Loader2 className={`h-6 w-6 animate-spin text-${accentColor}-600 dark:text-${accentColor}-400`} />
                <span className={`ml-2 text-${accentColor}-600 dark:text-${accentColor}-400`}>{loadingMessage}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default TestLayout;
