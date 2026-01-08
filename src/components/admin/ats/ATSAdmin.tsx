import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Brain,
  Zap,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Download,
  Upload,
  Settings,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { AdvancedStatsDashboard } from './AdvancedStatsDashboard';
import { CVComparisonTool } from './CVComparisonTool';
import { AdvancedATSDashboard } from './AdvancedATSDashboard';

interface ATSStats {
  totalCVAnalyzed: number;
  averageScore: number;
  successRate: number;
  processingTime: number;
  monthlyGrowth: number;
  topSkills: Array<{ name: string; count: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
}

interface RecentAnalysis {
  id: string;
  fileName: string;
  score: number;
  confidence: number;
  processingTime: number;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
}

export const ATSAdmin: React.FC = () => {
  const [stats, setStats] = useState<ATSStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadATSData();
  }, []);

  const loadATSData = async () => {
    setIsLoading(true);
    
    // Mock data pour la démo
    setTimeout(() => {
      setStats({
        totalCVAnalyzed: 1247,
        averageScore: 72.5,
        successRate: 84.3,
        processingTime: 8.2,
        monthlyGrowth: 23.5,
        topSkills: [
          { name: 'JavaScript', count: 234 },
          { name: 'Python', count: 189 },
          { name: 'React', count: 156 },
          { name: 'Node.js', count: 134 },
          { name: 'SQL', count: 123 }
        ],
        scoreDistribution: [
          { range: '80-100', count: 156 },
          { range: '60-79', count: 423 },
          { range: '40-59', count: 389 },
          { range: '0-39', count: 279 }
        ]
      });

      setRecentAnalyses([
        {
          id: '1',
          fileName: 'CV_Jean_Mabiala.pdf',
          score: 87,
          confidence: 94,
          processingTime: 7,
          createdAt: '2024-01-22T14:30:00',
          status: 'completed'
        },
        {
          id: '2',
          fileName: 'Resume_Marie_Kouba.docx',
          score: 72,
          confidence: 89,
          processingTime: 9,
          createdAt: '2024-01-22T14:25:00',
          status: 'completed'
        },
        {
          id: '3',
          fileName: 'CV_Sarah_Nzouba.pdf',
          score: 65,
          confidence: 82,
          processingTime: 8,
          createdAt: '2024-01-22T14:20:00',
          status: 'completed'
        },
        {
          id: '4',
          fileName: 'Resume_Pierre_Makaya.pdf',
          score: 0,
          confidence: 0,
          processingTime: 0,
          createdAt: '2024-01-22T14:15:00',
          status: 'processing'
        }
      ]);

      setIsLoading(false);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des données ATS...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* En-tête avec titre moderne */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tableau de Bord ATS
            </h1>
            <p className="text-gray-600 text-lg">Intelligence Artificielle pour l'Analyse de CV</p>
          </div>
        </div>
      </motion.div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+{stats?.monthlyGrowth}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600">{stats?.totalCVAnalyzed.toLocaleString()}</div>
              <div className="text-sm text-gray-600">CV Analysés</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+2.3%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600">{stats?.averageScore}</div>
              <div className="text-sm text-gray-600">Score Moyen</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+1.8%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-600">{stats?.successRate}%</div>
              <div className="text-sm text-gray-600">Taux de Réussite</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">-0.5ms</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-600">{stats?.processingTime}ms</div>
              <div className="text-sm text-gray-600">Temps Moyen</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Onglets principaux */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analyses">Analyses Récentes</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="advanced">Advanced 🚀</TabsTrigger>
          <TabsTrigger value="comparison">Comparateur</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution des scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    Distribution des Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.scoreDistribution.map((item, index) => (
                      <div key={item.range} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.range}</span>
                          <span className="text-gray-600">{item.count} CV</span>
                        </div>
                        <Progress 
                          value={(item.count / (stats?.totalCVAnalyzed || 1)) * 100} 
                          className="h-3"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top compétences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-purple-600" />
                    Top Compétences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topSkills.map((skill, index) => (
                      <div key={skill.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{skill.name}</span>
                        </div>
                        <Badge variant="secondary">{skill.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                  Performance de l'IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                    <div className="text-sm text-gray-600">Précision</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">8.2ms</div>
                    <div className="text-sm text-gray-600">Temps de Réponse</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">99.8%</div>
                    <div className="text-sm text-gray-600">Disponibilité</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analyses récentes */}
        <TabsContent value="analyses" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-green-600" />
                    Analyses Récentes
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrer
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(analysis.status)}
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{analysis.fileName}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(analysis.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {analysis.status === 'completed' && (
                          <>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getScoreColor(analysis.score).split(' ')[0]}`}>
                                {analysis.score}
                              </div>
                              <div className="text-xs text-gray-600">Score</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{analysis.confidence}%</div>
                              <div className="text-xs text-gray-600">Confiance</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{analysis.processingTime}ms</div>
                              <div className="text-xs text-gray-600">Temps</div>
                            </div>
                          </>
                        )}
                        
                        <div className="flex gap-2">
                          {analysis.status === 'completed' && (
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analytiques */}
        <TabsContent value="analytics" className="space-y-6">
          <AdvancedStatsDashboard />
        </TabsContent>

        {/* Dashboard Avancé */}
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedATSDashboard />
        </TabsContent>

        {/* Comparateur de CV */}
        <TabsContent value="comparison" className="space-y-6">
          <CVComparisonTool />
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-gray-600" />
                  Paramètres ATS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Seuil de score minimum</h3>
                      <p className="text-sm text-gray-600">Score minimum pour considérer un CV comme acceptable</p>
                    </div>
                    <Badge variant="outline">60</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Temps de traitement max</h3>
                      <p className="text-sm text-gray-600">Temps maximum autorisé pour l'analyse</p>
                    </div>
                    <Badge variant="outline">30s</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Confiance minimum</h3>
                      <p className="text-sm text-gray-600">Niveau de confiance minimum pour valider l'analyse</p>
                    </div>
                    <Badge variant="outline">80%</Badge>
                  </div>
                  
                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier les Paramètres
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
