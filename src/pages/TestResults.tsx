
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Share2,
  Eye,
  Star,
  Activity,
  Lightbulb,
  Briefcase,
  Users,
  ArrowRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestResults() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  // Données simulées pour les résultats de tests
  const testResults = [
    {
      id: 1,
      name: 'Test RIASEC',
      date: '2024-01-10',
      score: 85,
      status: 'completed',
      duration: '45 min',
      type: 'riasec',
      description: 'Test d\'orientation professionnelle basé sur les types RIASEC',
      results: {
        Realistic: 75,
        Investigative: 80,
        Artistic: 65,
        Social: 70,
        Enterprising: 85,
        Conventional: 60
      },
      recommendations: [
        'Développeur Web',
        'Chef de Projet',
        'Analyste de Données'
      ]
    },
    {
      id: 2,
      name: 'Test d\'Intelligence Émotionnelle',
      date: '2024-01-08',
      score: 78,
      status: 'completed',
      duration: '30 min',
      type: 'emotional',
      description: 'Évaluation de votre quotient émotionnel',
      results: {
        'Conscience de soi': 80,
        'Auto-régulation': 75,
        'Motivation': 85,
        'Empathie': 70,
        'Compétences sociales': 78
      },
      recommendations: [
        'Manager',
        'Conseiller',
        'Formateur'
      ]
    },
    {
      id: 3,
      name: 'Test de Styles d\'Apprentissage',
      date: '2024-01-05',
      score: 92,
      status: 'completed',
      duration: '25 min',
      type: 'learning',
      description: 'Découverte de votre style d\'apprentissage préféré',
      results: {
        'Visuel': 90,
        'Auditif': 75,
        'Kinesthésique': 85,
        'Lecture/Écriture': 88
      },
      recommendations: [
        'Designer',
        'Architecte',
        'Ingénieur'
      ]
    },
    {
      id: 4,
      name: 'Test des Intelligences Multiples',
      date: '2024-01-20',
      score: null,
      status: 'scheduled',
      duration: '45 min',
      type: 'multiple',
      description: 'Évaluation de vos intelligences multiples',
      results: null,
      recommendations: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Activity className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredResults = activeTab === 'all' 
    ? testResults 
    : testResults.filter(result => result.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mes résultats de tests
              </h1>
              <p className="text-gray-600 mt-2">
                Consultez vos résultats et découvrez vos recommandations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau test
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tests complétés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {testResults.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Score moyen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(testResults.filter(r => r.score).reduce((acc, r) => acc + r.score!, 0) / testResults.filter(r => r.score).length)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Métiers suggérés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {testResults.filter(r => r.recommendations.length > 0).reduce((acc, r) => acc + r.recommendations.length, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tests à venir</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {testResults.filter(r => r.status === 'scheduled').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contenu principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Liste des résultats */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Résultats de tests
                    </CardTitle>
                    <CardDescription>
                      Consultez vos résultats et analyses détaillées
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="completed">Terminés</TabsTrigger>
                    <TabsTrigger value="in_progress">En cours</TabsTrigger>
                    <TabsTrigger value="scheduled">Programmés</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-6">
                    <div className="space-y-4">
                      {filteredResults.map((result) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{result.name}</h3>
                                  <p className="text-sm text-gray-500">{result.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{result.date}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{result.duration}</span>
                                </div>
                                {result.score && (
                                  <div className="flex items-center space-x-2">
                                    <BarChart3 className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">{result.score}%</span>
                                  </div>
                                )}
                              </div>

                              {result.status === 'completed' && result.results && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Résultats détaillés :</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(result.results).map(([key, value]) => (
                                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm font-medium text-gray-700">{key}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-blue-600 h-2 rounded-full" 
                                              style={{ width: `${value}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs text-gray-500">{value}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {result.recommendations.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Métiers suggérés :</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {result.recommendations.map((rec, index) => (
                                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                        <Briefcase className="h-3 w-3 mr-1" />
                                        {rec}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                              <Badge className={getStatusColor(result.status)}>
                                {getStatusIcon(result.status)}
                                <span className="ml-1 capitalize">
                                  {result.status === 'completed' ? 'Terminé' : 
                                   result.status === 'in_progress' ? 'En cours' : 
                                   result.status === 'scheduled' ? 'Programmé' : result.status}
                                </span>
                              </Badge>
                              
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Résumé des compétences */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Compétences identifiées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Leadership', level: 85, color: 'bg-blue-500' },
                    { name: 'Analyse', level: 78, color: 'bg-green-500' },
                    { name: 'Créativité', level: 72, color: 'bg-purple-500' },
                    { name: 'Communication', level: 80, color: 'bg-orange-500' },
                    { name: 'Organisation', level: 75, color: 'bg-red-500' }
                  ].map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-gray-500">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${skill.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prochain test */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Prochain test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Test des Intelligences Multiples</p>
                  <p className="text-sm text-gray-500">20 Janvier 2024 • 45 min</p>
                  <Button className="mt-3" size="sm">
                    Commencer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Nouveau test
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Consulter un conseiller
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Explorer les métiers
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter mes résultats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
