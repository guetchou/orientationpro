import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Star, TrendingUp, GraduationCap, CheckCircle, Award, Globe } from "lucide-react";
import { useState, useEffect } from "react";

export const StatisticsSection = () => {
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  const stats = [
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      value: "2,500+",
      label: "Étudiants orientés",
      description: "🎓 Des milliers d'étudiants nous font confiance",
      color: "blue",
      finalValue: 2500
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      value: "95%",
      label: "CV passent ATS",
      description: "Optimisation garantie pour les recruteurs",
      color: "green",
      finalValue: 95
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      value: "4.8/5",
      label: "Satisfaction",
      description: "Note moyenne de nos utilisateurs",
      color: "yellow",
      finalValue: 4.8
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-600" />,
      value: "150+",
      label: "Partenaires",
      description: "Réseau étendu d'établissements",
      color: "purple",
      finalValue: 150
    }
  ];

  useEffect(() => {
    const duration = 2000; // 2 secondes
    const steps = 60;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      setCounts(prevCounts => 
        prevCounts.map((count, index) => {
          const target = stats[index].finalValue;
          const increment = target / steps;
          
          if (count < target) {
            return Math.min(count + increment, target);
          }
          return target;
        })
      );
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50 relative overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Chiffres qui parlent
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La confiance de milliers d'étudiants et professionnels au Congo
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="pt-8 pb-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className={`w-16 h-16 mx-auto mb-4 bg-${stat.color}-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    {stat.icon}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {index === 2 ? `${counts[index].toFixed(1)}/5` : `${Math.floor(counts[index])}${index === 1 ? '%' : index === 3 ? '+' : '+'}`}
                  </motion.h3>
                  
                  <p className="font-semibold text-gray-800 mb-2">{stat.label}</p>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Section bonus - Preuves sociales */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pourquoi nous choisir ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">Tests scientifiquement validés</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">Accompagnement personnalisé</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">Résultats garantis</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
