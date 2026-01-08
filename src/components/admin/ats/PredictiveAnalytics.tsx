import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart,
  LineChart,
  Target,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Globe,
  Flag,
  Building,
  GraduationCap,
  Briefcase,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketTrend {
  sector: string;
  growthRate: number;
  demandLevel: 'high' | 'medium' | 'low';
  averageSalary: number;
  currency: 'XAF' | 'USD';
  location: string;
  skillsInDemand: string[];
  predictedGrowth: number;
}

interface HiringForecast {
  month: string;
  predictedHires: number;
  actualHires: number;
  confidence: number;
  departments: {
    name: string;
    predicted: number;
    actual: number;
  }[];
}

interface SalaryBenchmark {
  position: string;
  experience: string;
  minSalary: number;
  maxSalary: number;
  averageSalary: number;
  currency: 'XAF' | 'USD';
  marketPercentile: number;
  location: string;
  companySize: string;
}

interface TurnoverPrediction {
  department: string;
  currentTurnover: number;
  predictedTurnover: number;
  riskFactors: string[];
  retentionStrategies: string[];
  confidence: number;
}

export const PredictiveAnalytics = () => {
  const [activeTab, setActiveTab] = useState('market');
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('6m');

  // Données simulées adaptées au contexte congolais
  const marketTrends: MarketTrend[] = [
    {
      sector: 'Technologies de l\'Information',
      growthRate: 15.2,
      demandLevel: 'high',
      averageSalary: 650000,
      currency: 'XAF',
      location: 'Brazzaville',
      skillsInDemand: ['React/Node.js', 'Python/Data Science', 'DevOps'],
      predictedGrowth: 18.5
    },
    {
      sector: 'Pétrole et Gaz',
      growthRate: 8.7,
      demandLevel: 'medium',
      averageSalary: 850000,
      currency: 'XAF',
      location: 'Pointe-Noire',
      skillsInDemand: ['Gestion de projet', 'Sécurité industrielle', 'Logistique'],
      predictedGrowth: 12.3
    },
    {
      sector: 'Banque et Finance',
      growthRate: 12.1,
      demandLevel: 'high',
      averageSalary: 720000,
      currency: 'XAF',
      location: 'Brazzaville',
      skillsInDemand: ['Analyse financière', 'Compliance', 'Digital Banking', 'Risk Management'],
      predictedGrowth: 14.8
    },
    {
      sector: 'Télécommunications',
      growthRate: 6.3,
      demandLevel: 'medium',
      averageSalary: 580000,
      currency: 'XAF',
      location: 'Toutes régions',
      skillsInDemand: ['5G/Infrastructure', 'Customer Service', 'Network Security', 'Sales'],
      predictedGrowth: 9.2
    }
  ];

  const hiringForecast: HiringForecast[] = [
    {
      month: 'Janvier 2024',
      predictedHires: 12,
      actualHires: 11,
      confidence: 92,
      departments: [
        { name: 'IT', predicted: 5, actual: 4 },
        { name: 'Marketing', predicted: 3, actual: 3 },
        { name: 'Sales', predicted: 4, actual: 4 }
      ]
    },
    {
      month: 'Février 2024',
      predictedHires: 15,
      actualHires: 14,
      confidence: 88,
      departments: [
        { name: 'IT', predicted: 6, actual: 5 },
        { name: 'Marketing', predicted: 4, actual: 4 },
        { name: 'Sales', predicted: 5, actual: 5 }
      ]
    },
    {
      month: 'Mars 2024',
      predictedHires: 18,
      actualHires: 17,
      confidence: 85,
      departments: [
        { name: 'IT', predicted: 8, actual: 7 },
        { name: 'Marketing', predicted: 5, actual: 5 },
        { name: 'Sales', predicted: 5, actual: 5 }
      ]
    }
  ];

  const salaryBenchmarks: SalaryBenchmark[] = [
    {
      position: 'Développeur Full Stack',
      experience: '3-5 ans',
      minSalary: 450000,
      maxSalary: 750000,
      averageSalary: 600000,
      currency: 'XAF',
      marketPercentile: 75,
      location: 'Brazzaville',
      companySize: '50-200 employés'
    },
    {
      position: 'Chef de Projet IT',
      experience: '5-8 ans',
      minSalary: 650000,
      maxSalary: 950000,
      averageSalary: 800000,
      currency: 'XAF',
      marketPercentile: 80,
      location: 'Pointe-Noire',
      companySize: '200+ employés'
    },
    {
      position: 'Data Analyst',
      experience: '2-4 ans',
      minSalary: 380000,
      maxSalary: 580000,
      averageSalary: 480000,
      currency: 'XAF',
      marketPercentile: 70,
      location: 'Brazzaville',
      companySize: '50-200 employés'
    },
    {
      position: 'DevOps Engineer',
      experience: '4-6 ans',
      minSalary: 550000,
      maxSalary: 850000,
      averageSalary: 700000,
      currency: 'XAF',
      marketPercentile: 85,
      location: 'Brazzaville',
      companySize: '200+ employés'
    }
  ];

  const turnoverPredictions: TurnoverPrediction[] = [
    {
      department: 'Développement IT',
      currentTurnover: 8.5,
      predictedTurnover: 12.3,
      riskFactors: ['Concurrence accrue', 'Salaires sous-marché', 'Manque de formation'],
      retentionStrategies: ['Augmentation salariale', 'Formation continue', 'Projets innovants'],
      confidence: 78
    },
    {
      department: 'Marketing Digital',
      currentTurnover: 15.2,
      predictedTurnover: 18.7,
      riskFactors: ['Évolution rapide des technologies', 'Pression des objectifs', 'Manque de reconnaissance'],
      retentionStrategies: ['Reconnaissance des performances', 'Formation aux nouvelles technologies', 'Équilibre vie pro/perso'],
      confidence: 82
    },
    {
      department: 'Ventes',
      currentTurnover: 22.1,
      predictedTurnover: 25.4,
      riskFactors: ['Pression des objectifs', 'Concurrence des startups', 'Manque de progression'],
      retentionStrategies: ['Plan de carrière clair', 'Commission attractive', 'Formation leadership'],
      confidence: 75
    }
  ];

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDemandBadge = (level: string) => {
    switch (level) {
      case 'high': return <Badge className="bg-green-100 text-green-800">Forte demande</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Demande moyenne</Badge>;
      case 'low': return <Badge className="bg-red-100 text-red-800">Faible demande</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-CG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Prédictifs - Congo</h2>
          <p className="text-gray-600">Prévisions et analyse de marché adaptées au contexte local</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Congo-Brazzaville
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Marché</TabsTrigger>
          <TabsTrigger value="forecast">Prévisions</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-6">
          <div className="grid gap-6">
            {marketTrends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {trend.sector}
                      </CardTitle>
                      <p className="text-gray-600">{trend.location}</p>
                    </div>
                    <Badge className={trend.demandLevel === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {trend.demandLevel === 'high' ? 'Forte demande' : 'Demande moyenne'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+{trend.growthRate}%</div>
                      <div className="text-sm text-gray-600">Croissance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(trend.averageSalary, trend.currency)}
                      </div>
                      <div className="text-sm text-gray-600">Salaire moyen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        +{trend.predictedGrowth}%
                      </div>
                      <div className="text-sm text-gray-600">Prédiction</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Compétences en demande</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.skillsInDemand.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Prévisions de recrutement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">45</div>
                    <div className="text-sm text-gray-600">Embauches prédites</div>
                    <div className="text-xs text-gray-500">Prochains 6 mois</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-gray-600">Précision IA</div>
                    <div className="text-xs text-gray-500">Basé sur historique</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">+18%</div>
                    <div className="text-sm text-gray-600">Croissance prévue</div>
                    <div className="text-xs text-gray-500">vs période précédente</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Benchmark salarial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">Développeur Full Stack</div>
                      <div className="text-sm text-gray-600">3-5 ans d'expérience</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{formatCurrency(600000, 'XAF')}</div>
                      <div className="text-xs text-gray-500">Salaire moyen</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">Chef de Projet IT</div>
                      <div className="text-sm text-gray-600">5-8 ans d'expérience</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{formatCurrency(800000, 'XAF')}</div>
                      <div className="text-xs text-gray-500">Salaire moyen</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">Data Analyst</div>
                      <div className="text-sm text-gray-600">2-4 ans d'expérience</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{formatCurrency(480000, 'XAF')}</div>
                      <div className="text-xs text-gray-500">Salaire moyen</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 