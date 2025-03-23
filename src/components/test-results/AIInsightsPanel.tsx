
import React from 'react';
import { AIEnhancedAnalysis } from '@/types/test';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Lightbulb, Star, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export interface AIInsightsPanelProps {
  analysis: AIEnhancedAnalysis;
  testType: string;
  insights?: any; // For backward compatibility
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ analysis, testType, insights }) => {
  // Use insights if provided (for backward compatibility), otherwise use analysis
  const data = insights || analysis;
  
  if (!data) {
    return (
      <Card className="mb-6 border-dashed border-2 bg-gray-50/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-500">
            <Brain className="h-5 w-5" />
            Analyse IA en cours de génération
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <Sparkles className="h-5 w-5 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <p className="text-muted-foreground text-center">
            Nos algorithmes sont en train d'analyser vos résultats pour générer des insights personnalisés.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.error) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Analyse IA indisponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nous n'avons pas pu générer une analyse pour ce test. Veuillez réessayer ultérieurement.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Animation for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="mb-6"
    >
      <Card className="border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-blue-50/30 pointer-events-none" />
        
        <CardHeader className="relative z-10 border-b border-primary/10 pb-4">
          <motion.div variants={item}>
            <CardTitle className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <span>Analyse IA de votre profil {testType}</span>
              </div>
            </CardTitle>
          </motion.div>
        </CardHeader>
        
        <CardContent className="pt-6 relative z-10">
          {data.dominantTraits && data.dominantTraits.length > 0 && (
            <motion.div variants={item} className="mb-6">
              <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-primary-700">
                <Star className="h-5 w-5 text-amber-500" />
                Traits dominants
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.dominantTraits.map((trait, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {data.strengths && data.strengths.length > 0 && (
            <motion.div variants={item} className="mb-6">
              <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-primary-700">
                <Activity className="h-5 w-5 text-green-500" />
                Vos forces
              </h4>
              <ul className="space-y-2">
                {data.strengths.map((strength, index) => (
                  <li key={index} className="pl-6 relative">
                    <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-green-100 border-2 border-green-400"></div>
                    {strength}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {data.weaknesses && data.weaknesses.length > 0 && (
            <motion.div variants={item} className="mb-6">
              <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-primary-700">
                <Target className="h-5 w-5 text-orange-500" />
                Axes d'amélioration
              </h4>
              <ul className="space-y-2">
                {data.weaknesses.map((weakness, index) => (
                  <li key={index} className="pl-6 relative">
                    <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-orange-100 border-2 border-orange-400"></div>
                    {weakness}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {data.recommendations && data.recommendations.length > 0 && (
            <motion.div variants={item} className="mb-0">
              <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-primary-700">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                Recommandations personnalisées
              </h4>
              <ul className="space-y-3">
                {data.recommendations.map((recommendation, index) => (
                  <li key={index} className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIInsightsPanel;
