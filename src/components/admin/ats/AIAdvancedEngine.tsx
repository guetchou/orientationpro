import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Target,
  Users,
  BarChart3,
  Zap,
  Eye,
  Download,
  Settings,
  Globe,
  Flag,
  GraduationCap,
  Briefcase,
  MapPin,
  Clock,
  Star,
  Activity,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface CandidatePrediction {
  id: string;
  name: string;
  position: string;
  performanceScore: number;
  retentionProbability: number;
  culturalFit: number;
  skillMatch: number;
  marketDemand: number;
  salaryExpectation: number;
  location: string;
  education: string;
  experience: string;
  languages: string[];
  certifications: string[];
  riskFactors: string[];
  recommendations: string[];
  predictedSalary: number;
  currency: 'XAF' | 'USD' | 'EUR';
}

interface SentimentAnalysis {
  candidateId: string;
  cvSentiment: 'positive' | 'neutral' | 'negative';
  interviewSentiment: 'positive' | 'neutral' | 'negative';
  motivationScore: number;
  confidenceLevel: number;
  redFlags: string[];
  positiveIndicators: string[];
}

interface FraudDetection {
  candidateId: string;
  riskLevel: 'low' | 'medium' | 'high';
  fraudIndicators: string[];
  documentAuthenticity: number;
  consistencyScore: number;
  verificationStatus: 'pending' | 'verified' | 'suspicious';
}

export const AIAdvancedEngine = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // Données simulées adaptées au contexte congolais
  const predictions: CandidatePrediction[] = [
    {
      id: '1',
      name: 'Marie Nzouzi',
      position: 'Développeur Full Stack',
      performanceScore: 87,
      retentionProbability: 92,
      culturalFit: 88,
      skillMatch: 85,
      marketDemand: 95,
      salaryExpectation: 450000,
      location: 'Brazzaville',
      education: 'Master en Informatique - Université Marien Ngouabi',
      experience: '5 ans',
      languages: ['Français', 'Lingala', 'Anglais'],
      certifications: ['Microsoft Azure', 'AWS Cloud Practitioner'],
      riskFactors: ['Aucun'],
      recommendations: ['Excellent profil pour poste senior', 'Formation leadership recommandée'],
      predictedSalary: 550000,
      currency: 'XAF'
    },
    {
      id: '2',
      name: 'Pierre Makoumbou',
      position: 'Chef de Projet IT',
      performanceScore: 78,
      retentionProbability: 85,
      culturalFit: 82,
      skillMatch: 80,
      marketDemand: 88,
      salaryExpectation: 650000,
      location: 'Pointe-Noire',
      education: 'Ingénieur - École Nationale Supérieure Polytechnique',
      experience: '8 ans',
      languages: ['Français', 'Vili', 'Anglais'],
      certifications: ['PMP', 'Prince2'],
      riskFactors: ['Déplacements fréquents'],
      recommendations: ['Profil adapté pour projets pétroliers', 'Formation sécurité informatique'],
      predictedSalary: 750000,
      currency: 'XAF'
    },
    {
      id: '3',
      name: 'Sophie Loundou',
      position: 'Data Analyst',
      performanceScore: 92,
      retentionProbability: 95,
      culturalFit: 90,
      skillMatch: 88,
      marketDemand: 98,
      salaryExpectation: 380000,
      location: 'Brazzaville',
      education: 'Master en Statistiques - Université Marien Ngouabi',
      experience: '3 ans',
      languages: ['Français', 'Lingala', 'Anglais'],
      certifications: ['Tableau', 'Power BI', 'Python'],
      riskFactors: ['Aucun'],
      recommendations: ['Profil exceptionnel', 'Formation IA/ML recommandée'],
      predictedSalary: 480000,
      currency: 'XAF'
    }
  ];

  const sentimentAnalysis: SentimentAnalysis[] = [
    {
      candidateId: '1',
      cvSentiment: 'positive',
      interviewSentiment: 'positive',
      motivationScore: 95,
      confidenceLevel: 92,
      redFlags: [],
      positiveIndicators: ['Motivation élevée', 'Projets concrets', 'Engagement communautaire']
    },
    {
      candidateId: '2',
      cvSentiment: 'positive',
      interviewSentiment: 'neutral',
      motivationScore: 78,
      confidenceLevel: 75,
      redFlags: ['Réponses vagues sur objectifs'],
      positiveIndicators: ['Expérience solide', 'Certifications pertinentes']
    }
  ];

  const fraudDetection: FraudDetection[] = [
    {
      candidateId: '1',
      riskLevel: 'low',
      fraudIndicators: [],
      documentAuthenticity: 98,
      consistencyScore: 95,
      verificationStatus: 'verified'
    },
    {
      candidateId: '2',
      riskLevel: 'medium',
      fraudIndicators: ['Incohérences dans dates d\'expérience'],
      documentAuthenticity: 85,
      consistencyScore: 78,
      verificationStatus: 'suspicious'
    }
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'neutral': return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'negative': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-CG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IA Avancée - Contexte Congolais</h2>
          <p className="text-gray-600">Prédictions, analyse de sentiment et détection de fraude adaptées au marché local</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Congo-Brazzaville
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuration IA
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="fraud">Détection Fraude</TabsTrigger>
          <TabsTrigger value="market">Marché Local</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {prediction.name}
                      </CardTitle>
                      <p className="text-gray-600">{prediction.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {prediction.location}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {prediction.education.split(' - ')[1]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scores principaux */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(prediction.performanceScore)}`}>
                        {prediction.performanceScore}%
                      </div>
                      <div className="text-sm text-gray-600">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(prediction.retentionProbability)}`}>
                        {prediction.retentionProbability}%
                      </div>
                      <div className="text-sm text-gray-600">Rétention</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(prediction.culturalFit)}`}>
                        {prediction.culturalFit}%
                      </div>
                      <div className="text-sm text-gray-600">Fit Culturel</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(prediction.skillMatch)}`}>
                        {prediction.skillMatch}%
                      </div>
                      <div className="text-sm text-gray-600">Compétences</div>
                    </div>
                  </div>

                  {/* Salaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Salaire demandé</span>
                        <span className="text-sm text-gray-600">{formatCurrency(prediction.salaryExpectation, prediction.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Salaire prédit</span>
                        <span className="text-sm font-bold text-green-600">{formatCurrency(prediction.predictedSalary, prediction.currency)}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Demande marché</span>
                        <span className="text-sm text-gray-600">{prediction.marketDemand}%</span>
                      </div>
                      <Progress value={prediction.marketDemand} className="h-2" />
                    </div>
                  </div>

                  {/* Langues et certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Langues</h4>
                      <div className="flex flex-wrap gap-1">
                        {prediction.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-1">
                        {prediction.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommandations */}
                  <div>
                    <h4 className="font-semibold mb-2">Recommandations IA</h4>
                    <div className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid gap-6">
            {sentimentAnalysis.map((analysis) => {
              const candidate = predictions.find(p => p.id === analysis.candidateId);
              return (
                <Card key={analysis.candidateId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Analyse de Sentiment - {candidate?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">CV</span>
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(analysis.cvSentiment)}
                            <span className="text-sm capitalize">{analysis.cvSentiment}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Entretien</span>
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(analysis.interviewSentiment)}
                            <span className="text-sm capitalize">{analysis.interviewSentiment}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Motivation</span>
                          <span className="text-sm font-bold">{analysis.motivationScore}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Confiance</span>
                          <span className="text-sm font-bold">{analysis.confidenceLevel}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">Indicateurs Positifs</h4>
                          <div className="space-y-1">
                            {analysis.positiveIndicators.map((indicator, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-sm">{indicator}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {analysis.redFlags.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-red-600">Alertes</h4>
                            <div className="space-y-1">
                              {analysis.redFlags.map((flag, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  <span className="text-sm">{flag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-6">
          <div className="grid gap-6">
            {fraudDetection.map((detection) => {
              const candidate = predictions.find(p => p.id === detection.candidateId);
              return (
                <Card key={detection.candidateId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Détection Fraude - {candidate?.name}
                      </CardTitle>
                      <Badge 
                        variant={detection.riskLevel === 'high' ? 'destructive' : detection.riskLevel === 'medium' ? 'secondary' : 'default'}
                        className="flex items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Risque {detection.riskLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{detection.documentAuthenticity}%</div>
                        <div className="text-sm text-gray-600">Authenticité Documents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{detection.consistencyScore}%</div>
                        <div className="text-sm text-gray-600">Cohérence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold capitalize">{detection.verificationStatus}</div>
                        <div className="text-sm text-gray-600">Statut Vérification</div>
                      </div>
                    </div>
                    
                    {detection.fraudIndicators.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">Indicateurs de Fraude</h4>
                        <div className="space-y-1">
                          {detection.fraudIndicators.map((indicator, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span className="text-sm">{indicator}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analyse du Marché Congolais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-gray-600">Demande IT</div>
                    <div className="text-xs text-gray-500">En hausse de 15%</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">450K XAF</div>
                    <div className="text-sm text-gray-600">Salaire moyen</div>
                    <div className="text-xs text-gray-500">Développeur junior</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-gray-600">Taux de rétention</div>
                    <div className="text-xs text-gray-500">Secteur IT</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Compétences les plus demandées</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['React/Node.js', 'Python/Data', 'DevOps/AWS', 'Mobile/Flutter'].map((skill, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{skill}</div>
                        <div className="text-sm text-gray-600">{85 - index * 10}% demande</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 