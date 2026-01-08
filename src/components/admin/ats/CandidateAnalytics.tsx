
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  conversionRate: number;
  averageTimeToHire: number;
  sourceEffectiveness: Array<{ source: string; candidates: number; hired: number }>;
  monthlyTrends: Array<{ month: string; applications: number; hires: number }>;
}

interface CandidateAnalyticsProps {
  data: AnalyticsData;
  loading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const CandidateAnalytics: React.FC<CandidateAnalyticsProps> = ({ data, loading }) => {
  if (loading) {
    return <div>Chargement des analyses...</div>;
  }

  const getTrendIcon = (current: number, previous: number) => {
    return current > previous ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Taux de conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.conversionRate}%</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <TrendingUp className="h-3 w-3" />
                +2.5% ce mois
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Temps moyen d'embauche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{data.averageTimeToHire} jours</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <TrendingDown className="h-3 w-3" />
                -3 jours
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Candidatures actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">47</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <TrendingUp className="h-3 w-3" />
                +12 cette semaine
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Taux d'abandon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">12%</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <TrendingDown className="h-3 w-3" />
                -1.2% amélioration
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Source Effectiveness */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              Efficacité des sources de recrutement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.sourceEffectiveness.map((source, index) => {
                const effectiveness = (source.hired / source.candidates) * 100;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{source.source}</Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {source.candidates} candidats • {source.hired} embauches
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={effectiveness} className="w-24" />
                      <span className="text-sm font-medium w-12 text-right">
                        {effectiveness.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
