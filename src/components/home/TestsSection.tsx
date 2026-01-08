
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TestCard } from "./TestCard";
import { TestSelector } from "./TestSelector";
import { testsData } from "./testsData";

export const TestsSection = () => {
  const navigate = useNavigate();
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const activeTest = testsData[activeTestIndex];

  return (
    <section id="tests" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Tests d'orientation professionnelle
          </h2>
          <p className="text-gray-600 text-lg">
            Découvrez-vous à travers nos tests scientifiquement validés et obtenez des recommandations personnalisées
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Test Selector Component */}
          <TestSelector
            tests={testsData}
            activeTestIndex={activeTestIndex}
            setActiveTestIndex={setActiveTestIndex}
            onViewAllTests={() => navigate('/tests')}
          />

          {/* Test Card Component */}
          <TestCard test={activeTest} />
        </div>
      </div>
    </section>
  );
};
