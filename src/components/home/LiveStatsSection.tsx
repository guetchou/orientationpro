import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp,
  Award,
  Target,
  Calendar,
  MessageSquare,
  FileText,
  Brain,
  CheckCircle,
  Star
} from 'lucide-react';

interface LiveStats {
  totalUsers: number;
  totalJobs: number;
  totalCompanies: number;
  totalApplications: number;
  successRate: number;
  averageMatchScore: number;
  totalTests: number;
  totalAppointments: number;
}

export const LiveStatsSection: React.FC = () => {
  const [stats, setStats] = useState<LiveStats>({
    totalUsers: 15420,
    totalJobs: 487,
    totalCompanies: 156,
    totalApplications: 2847,
    successRate: 94,
    averageMatchScore: 87,
    totalTests: 8923,
    totalAppointments: 1247
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('live-stats');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const statCards = [
    {
      icon: Users,
      value: stats.totalUsers,
      label: 'Utilisateurs actifs',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      suffix: '+'
    },
    {
      icon: Briefcase,
      value: stats.totalJobs,
      label: 'Offres d\'emploi',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      suffix: '+'
    },
    {
      icon: Building2,
      value: stats.totalCompanies,
      label: 'Entreprises partenaires',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      suffix: '+'
    },
    {
      icon: Target,
      value: stats.totalApplications,
      label: 'Candidatures',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      suffix: '+'
    },
    {
      icon: CheckCircle,
      value: stats.successRate,
      label: 'Taux de réussite',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      suffix: '%'
    },
    {
      icon: TrendingUp,
      value: stats.averageMatchScore,
      label: 'Score matching moyen',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      suffix: '%'
    },
    {
      icon: Brain,
      value: stats.totalTests,
      label: 'Tests réalisés',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      suffix: '+'
    },
    {
      icon: Calendar,
      value: stats.totalAppointments,
      label: 'Rendez-vous',
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      suffix: '+'
    }
  ];

  const AnimatedNumber: React.FC<{ value: number; suffix: string }> = ({ value, suffix }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (isVisible) {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
          currentStep++;
          const newValue = Math.min(Math.floor(increment * currentStep), value);
          setDisplayValue(newValue);

          if (currentStep >= steps) {
            clearInterval(timer);
            setDisplayValue(value);
          }
        }, stepDuration);

        return () => clearInterval(timer);
      }
    }, [isVisible, value]);

    return (
      <span>
        {displayValue.toLocaleString()}{suffix}
      </span>
    );
  };

  return (
    <section id="live-stats" className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Statistiques en temps réel
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Notre impact en chiffres
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Des milliers de Congolais nous font confiance pour leur orientation professionnelle 
            et leur recherche d'emploi. Découvrez notre impact sur le marché de l'emploi.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-500 group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-gray-300 text-sm">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Section des réalisations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Reconnu par l'État</h3>
            <p className="text-gray-300">
              Partenaire officiel du ministère de l'Enseignement supérieur du Congo
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Certifié ISO 27001</h3>
            <p className="text-gray-300">
              Certification internationale pour la sécurité des données
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Croissance continue</h3>
            <p className="text-gray-300">
              +150% d'utilisateurs cette année grâce à notre innovation
            </p>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">
              Rejoignez la communauté qui transforme l'avenir professionnel au Congo
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Plus de 15 000 personnes nous font déjà confiance. 
              Découvrez pourquoi nous sommes la référence en orientation professionnelle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Commencer maintenant
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300">
                En savoir plus
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
