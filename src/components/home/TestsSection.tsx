import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TestCard } from './TestCard';
import { TestSelector } from './TestSelector';
import { testsData } from './testsData';

export const TestsSection = () => {
  const navigate = useNavigate();
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  const activeTest = testsData[activeTestIndex];

  return (
    <section id="tests" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
      <div className="absolute left-0 top-0 h-20 w-full bg-gradient-to-b from-white to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            Outils d’exploration professionnelle
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Ces outils soutiennent la réflexion personnelle. Leur statut, leur méthode et leurs limites doivent être consultés avant d’interpréter un résultat.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <TestSelector
            tests={testsData}
            activeTestIndex={activeTestIndex}
            setActiveTestIndex={setActiveTestIndex}
            onViewAllTests={() => navigate('/tests')}
          />
          <TestCard test={activeTest} />
        </div>
      </div>
    </section>
  );
};
