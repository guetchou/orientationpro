import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Activity,
  TrendingUp,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  Sparkles,
  Eye,
  BarChart3
} from 'lucide-react';

interface RealTimeAnalysisProps {
  analysisData: any;
  isAnalyzing: boolean;
  progress: number;
}

export const RealTimeAnalysis: React.FC<RealTimeAnalysisProps> = ({
  analysisData,
  isAnalyzing,
  progress
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const analysisSteps = [
    { icon: FileText, label: 'Extraction du texte', color: 'blue' },
    { icon: Brain, label: 'Analyse IA', color: 'purple' },
    { icon: Target, label: 'Calcul du score ATS', color: 'green' },
    { icon: Zap, label: 'Génération du rapport', color: 'orange' }
  ];

  useEffect(() => {
    if (isAnalyzing) {
      setCurrentStep(Math.floor(progress / 25));
      setShowResults(false);
    } else {
      setCurrentStep(4);
      setShowResults(true);
      
      // Animation du score final
      const targetScore = analysisData?.score || 0;
      const duration = 2000;
      const steps = 60;
      const increment = targetScore / steps;
      
      let currentScore = 0;
      const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(currentScore));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isAnalyzing, progress, analysisData]);

  const getStepColor = (step: number, current: number) => {
    if (step < current) return 'text-green-600 bg-green-100';
    if (step === current) return 'text-blue-600 bg-blue-100';
    return 'text-gray-400 bg-gray-100';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Processus d'analyse en temps réel */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <Brain className="w-6 h-6" />
                  Analyse en Cours...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Étapes d'analyse */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analysisSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl transition-all duration-500 ${getStepColor(index, currentStep)}`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="relative">
                          <step.icon className="w-8 h-8" />
                          {index === currentStep && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute -top-1 -right-1"
                            >
                              <Activity className="w-4 h-4 text-blue-600" />
                            </motion.div>
                          )}
                          {index < currentStep && (
                            <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{step.label}</span>
                        {index === currentStep && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="h-1 bg-blue-600 rounded-full"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Barre de progression globale */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progression globale</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-white/50" />
                </div>

                {/* Animation de traitement */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="p-4 bg-white rounded-full shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats avec animations */}
      <AnimatePresence>
        {showResults && analysisData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Score principal animé */}
            <Card className={`border-2 ${getScoreBg(animatedScore)}`}>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 10,
                      delay: 0.5 
                    }}
                    className="inline-block"
                  >
                    <div className={`text-8xl font-bold ${getScoreColor(animatedScore)}`}>
                      {animatedScore}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Score ATS Global
                    </h2>
                    <p className="text-gray-600">
                      {animatedScore >= 80 ? 'Excellent ! Votre CV est très bien optimisé.' :
                       animatedScore >= 60 ? 'Bon score ! Quelques améliorations possibles.' :
                       animatedScore >= 40 ? 'Score moyen. Plusieurs points à améliorer.' :
                       'Score faible. Refonte recommandée.'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <Progress 
                      value={animatedScore} 
                      className="h-4 bg-white/50 max-w-md mx-auto"
                    />
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Métriques détaillées avec animations séquentielles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Confiance IA', 
                  value: `${analysisData.confidence || 0}%`, 
                  icon: Brain, 
                  color: 'blue',
                  delay: 1.4
                },
                { 
                  label: 'Compétences', 
                  value: (analysisData.skills?.technical?.length || 0) + (analysisData.skills?.soft?.length || 0), 
                  icon: Target, 
                  color: 'green',
                  delay: 1.6
                },
                { 
                  label: 'Sections', 
                  value: Object.values(analysisData.sections || {}).filter(Boolean).length, 
                  icon: FileText, 
                  color: 'purple',
                  delay: 1.8
                },
                { 
                  label: 'Temps', 
                  value: '8ms', 
                  icon: Clock, 
                  color: 'orange',
                  delay: 2.0
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: metric.delay,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: metric.delay + 0.2,
                          type: "spring",
                          stiffness: 200
                        }}
                        className={`p-3 bg-${metric.color}-100 rounded-full w-fit mx-auto mb-4`}
                      >
                        <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: metric.delay + 0.4 }}
                        className={`text-2xl font-bold text-${metric.color}-600 mb-1`}
                      >
                        {metric.value}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: metric.delay + 0.6 }}
                        className="text-sm text-gray-600"
                      >
                        {metric.label}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Informations personnelles animées */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    Informations Extraites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { 
                        icon: User, 
                        label: 'Nom', 
                        value: analysisData.personalInfo?.name || 'Non détecté',
                        color: 'blue'
                      },
                      { 
                        icon: Mail, 
                        label: 'Email', 
                        value: analysisData.personalInfo?.email || 'Non détecté',
                        color: 'green'
                      },
                      { 
                        icon: Phone, 
                        label: 'Téléphone', 
                        value: analysisData.personalInfo?.phone || 'Non détecté',
                        color: 'purple'
                      },
                      { 
                        icon: MapPin, 
                        label: 'Adresse', 
                        value: analysisData.personalInfo?.address || 'Non détecté',
                        color: 'orange'
                      }
                    ].map((info, index) => (
                      <motion.div
                        key={info.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.4 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className={`p-2 bg-${info.color}-100 rounded-lg`}>
                          <info.icon className={`w-5 h-5 text-${info.color}-600`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{info.label}</div>
                          <div className="text-sm text-gray-600">{info.value}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8 }}
            >
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        🎉 Analyse terminée !
                      </h3>
                      <p className="text-gray-600">
                        Votre CV a été analysé avec succès. Consultez les recommandations pour l'optimiser.
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <Eye className="w-4 h-4 mr-2 inline" />
                        Voir le rapport complet
                      </button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
