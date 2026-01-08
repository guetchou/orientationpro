import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Target,
  Users,
  Clock,
  Award,
  Star,
  Zap,
  Brain,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface AdvancedStatsDashboardProps {
  className?: string;
}

export const AdvancedStatsDashboard: React.FC<AdvancedStatsDashboardProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAnalyses: 1247,
    averageScore: 72.5,
    successRate: 84.3,
    processingTime: 8.2,
    monthlyGrowth: 23.5,
    dailyAnalyses: 42,
    topSkills: [
      { name: 'JavaScript', count: 234, trend: '+12%' },
      { name: 'Python', count: 189, trend: '+8%' },
      { name: 'React', count: 156, trend: '+15%' },
      { name: 'Node.js', count: 134, trend: '+6%' },
      { name: 'SQL', count: 123, trend: '+3%' }
    ],
    scoreDistribution: [
      { range: '80-100', count: 156, percentage: 12.5, color: 'green' },
      { range: '60-79', count: 423, percentage: 33.9, color: 'yellow' },
      { range: '40-59', count: 389, percentage: 31.2, color: 'orange' },
      { range: '0-39', count: 279, percentage: 22.4, color: 'red' }
    ],
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 20) + 5,
      peak: i >= 9 && i <= 17
    })),
    weeklyTrend: [
      { day: 'Lun', analyses: 45, score: 73 },
      { day: 'Mar', analyses: 52, score: 75 },
      { day: 'Mer', analyses: 48, score: 72 },
      { day: 'Jeu', analyses: 61, score: 76 },
      { day: 'Ven', analyses: 38, score: 71 },
      { day: 'Sam', analyses: 15, score: 69 },
      { day: 'Dim', analyses: 8, score: 68 }
    ]
  });

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend.startsWith('+') ? 
      <TrendingUp className="w-3 h-3 text-green-600" /> : 
      <TrendingDown className="w-3 h-3 text-red-600" />;
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simuler le rechargement des données
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques Avancées ATS</h2>
          <p className="text-gray-600">Analyse approfondie des performances et tendances</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales avec animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Analyses Total', 
            value: stats.totalAnalyses.toLocaleString(), 
            icon: BarChart3, 
            color: 'blue',
            trend: '+23.5%',
            delay: 0.1
          },
          { 
            label: 'Score Moyen', 
            value: stats.averageScore, 
            icon: Target, 
            color: 'green',
            trend: '+2.3%',
            delay: 0.2
          },
          { 
            label: 'Taux de Réussite', 
            value: `${stats.successRate}%`, 
            icon: Award, 
            color: 'purple',
            trend: '+1.8%',
            delay: 0.3
          },
          { 
            label: 'Temps Moyen', 
            value: `${stats.processingTime}ms`, 
            icon: Clock, 
            color: 'orange',
            trend: '-0.5ms',
            delay: 0.4
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: metric.delay }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${metric.color}-100 rounded-full`}>
                    <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs text-gray-600">{metric.trend}</span>
                  </div>
                </div>
                <div className={`text-3xl font-bold text-${metric.color}-600 mb-1`}>
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution des scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <PieChart className="w-6 h-6 text-blue-600" />
                Distribution des Scores ATS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.scoreDistribution.map((item, index) => (
                  <motion.div
                    key={item.range}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getColorClass(item.color)}`}></div>
                        <span className="font-medium">{item.range}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.count}</div>
                        <div className="text-sm text-gray-600">{item.percentage}%</div>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-3" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top compétences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Star className="w-6 h-6 text-purple-600" />
                Top Compétences Détectées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-gray-600">{skill.count} occurrences</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {skill.trend}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analyse temporelle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution horaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-green-600" />
                Distribution Horaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-1 h-32">
                  {stats.hourlyDistribution.map((hour, index) => (
                    <motion.div
                      key={hour.hour}
                      initial={{ height: 0 }}
                      animate={{ height: `${(hour.count / 25) * 100}%` }}
                      transition={{ delay: 1 + index * 0.02 }}
                      className={`relative rounded-t ${
                        hour.peak ? 'bg-blue-500' : 'bg-gray-300'
                      } hover:bg-blue-600 transition-colors`}
                      title={`${hour.hour}:00 - ${hour.count} analyses`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>00h</span>
                  <span>06h</span>
                  <span>12h</span>
                  <span>18h</span>
                  <span>24h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tendance hebdomadaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-orange-600" />
                Tendance Hebdomadaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.weeklyTrend.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                        {day.day}
                      </div>
                      <div>
                        <div className="font-medium">{day.analyses} analyses</div>
                        <div className="text-sm text-gray-600">Score moyen: {day.score}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">{day.score}</div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Résumé des performances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600" />
              Résumé des Performances IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">94.2%</div>
                <div className="text-sm text-gray-600 mb-1">Précision de l'IA</div>
                <Progress value={94.2} className="h-2" />
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">8.2ms</div>
                <div className="text-sm text-gray-600 mb-1">Temps de Réponse</div>
                <Progress value={82} className="h-2" />
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">99.8%</div>
                <div className="text-sm text-gray-600 mb-1">Disponibilité</div>
                <Progress value={99.8} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
