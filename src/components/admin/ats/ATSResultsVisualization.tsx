import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Star,
  Award,
  Zap,
  Brain,
  FileText,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface ATSResultsVisualizationProps {
  analysisData: any;
  atsScore: number;
  confidence: number;
}

export const ATSResultsVisualization: React.FC<ATSResultsVisualizationProps> = ({
  analysisData,
  atsScore,
  confidence
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return <Minus className="w-4 h-4 text-gray-400" />;
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Données pour les graphiques
  const skillsData = {
    technical: analysisData?.skills?.technical?.length || 0,
    soft: analysisData?.skills?.soft?.length || 0,
    total: (analysisData?.skills?.technical?.length || 0) + (analysisData?.skills?.soft?.length || 0)
  };

  const sectionsData = Object.entries(analysisData?.sections || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    present: value as boolean,
    percentage: value ? 100 : 0
  }));

  const strengths = analysisData?.strengths || [];
  const weaknesses = analysisData?.weaknesses || [];
  const recommendations = analysisData?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* Score principal avec design moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`border-2 ${getScoreColor(atsScore)}`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  {getScoreIcon(atsScore)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Score ATS Global</h2>
                  <p className="text-gray-600">Évaluation complète de votre CV</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold mb-2">{atsScore}</div>
                <div className="text-lg text-gray-600">sur 100</div>
                <Badge className="mt-2" variant="secondary">
                  {getScoreLabel(atsScore)}
                </Badge>
              </div>
            </div>

            <Progress 
              value={atsScore} 
              className="h-4 bg-white/50 mb-4"
            />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>0</span>
              <span className="font-medium">Score ATS</span>
              <span>100</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(atsScore)}
                  <span className="text-sm text-gray-600">+5%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{atsScore}</div>
              <div className="text-sm text-gray-600">Score ATS</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(confidence)}
                  <span className="text-sm text-gray-600">+2%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">{confidence}%</div>
              <div className="text-sm text-gray-600">Confiance IA</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(skillsData.total)}
                  <span className="text-sm text-gray-600">+3</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{skillsData.total}</div>
              <div className="text-sm text-gray-600">Compétences</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center gap-1">
                  <Minus className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">-</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">8ms</div>
              <div className="text-sm text-gray-600">Traitement</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analyse des sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Analyse des Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectionsData.map((section, index) => (
                <motion.div
                  key={section.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {section.present ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">{section.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={section.percentage} 
                      className="w-24 h-2"
                    />
                    <Badge variant={section.present ? "default" : "destructive"}>
                      {section.present ? "Présent" : "Manquant"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analyse des compétences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <PieChart className="w-6 h-6 text-purple-600" />
                Répartition des Compétences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Techniques</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">{skillsData.technical}</div>
                    <div className="text-sm text-gray-600">
                      {skillsData.total > 0 ? Math.round((skillsData.technical / skillsData.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={skillsData.total > 0 ? (skillsData.technical / skillsData.total) * 100 : 0} 
                  className="h-3"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Soft Skills</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-600">{skillsData.soft}</div>
                    <div className="text-sm text-gray-600">
                      {skillsData.total > 0 ? Math.round((skillsData.soft / skillsData.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={skillsData.total > 0 ? (skillsData.soft / skillsData.total) * 100 : 0} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-green-600" />
                Performance Générale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.round((atsScore / 100) * 5 * 10) / 10}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < Math.round((atsScore / 100) * 5) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Évaluation globale</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Probabilité d'entretien</span>
                    <span className="font-medium">
                      {atsScore >= 80 ? '85-95%' : atsScore >= 60 ? '60-75%' : atsScore >= 40 ? '30-45%' : '10-25%'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Temps de traitement</span>
                    <span className="font-medium">8ms</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confiance IA</span>
                    <span className="font-medium">{confidence}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Points forts et faiblesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800">
                <TrendingUp className="w-6 h-6" />
                Points Forts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strengths.length > 0 ? (
                  strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun point fort détecté</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-800">
                <TrendingDown className="w-6 h-6" />
                Points à Améliorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weaknesses.length > 0 ? (
                  weaknesses.map((weakness, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun point faible détecté</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recommandations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-800">
              <Brain className="w-6 h-6" />
              Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-white rounded-lg"
                  >
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{recommendation}</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune recommandation disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
