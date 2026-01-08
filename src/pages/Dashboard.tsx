import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  User, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  FileText,
  Award,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Users,
  Settings,
  Plus,
  ArrowRight,
  Star,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Rediriger les rôles spéciaux vers leurs dashboards respectifs
    // Seulement si l'utilisateur n'est pas déjà sur le dashboard utilisateur
    const currentPath = window.location.pathname;
    if (currentPath === '/dashboard') {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          return;
        case 'super_admin':
          navigate('/admin/super-admin', { replace: true });
          return;
        case 'conseiller':
          navigate('/conseiller/dashboard', { replace: true });
          return;
        default:
          // Pour les utilisateurs simples, rester sur cette page
          break;
      }
    }
  }, [user, navigate]);

  // Données simulées pour le dashboard utilisateur
  const userStats = {
    testsCompleted: 3,
    testsInProgress: 1,
    averageScore: 85,
    careerMatches: 5,
    nextAppointment: '2024-01-15',
    progressPercentage: 75
  };

  const recentTests = [
    { id: 1, name: 'Test RIASEC', date: '2024-01-10', score: 85, status: 'completed' },
    { id: 2, name: 'Test d\'Intelligence Émotionnelle', date: '2024-01-08', score: 78, status: 'completed' },
    { id: 3, name: 'Test de Styles d\'Apprentissage', date: '2024-01-05', score: 92, status: 'completed' }
  ];

  const upcomingTests = [
    { id: 1, name: 'Test des Intelligences Multiples', date: '2024-01-20', duration: '45 min' },
    { id: 2, name: 'Test de Reconversion Professionnelle', date: '2024-01-25', duration: '60 min' }
  ];

  const careerSuggestions = [
    { title: 'Développeur Web', match: 95, description: 'Basé sur vos résultats RIASEC' },
    { title: 'Chef de Projet', match: 88, description: 'Selon votre profil de leadership' },
    { title: 'Analyste de Données', match: 82, description: 'Compatible avec vos compétences' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary mb-4" />
        <p className="text-gray-600">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

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
                Bienvenue, {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} !
              </h1>
              <p className="text-gray-600 mt-2">
                Découvrez votre parcours d'orientation et vos progrès
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <User className="h-4 w-4 mr-1" />
                {user?.role || 'Utilisateur'}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tests complétés</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.testsCompleted}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Score moyen</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.averageScore}%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Métiers suggérés</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.careerMatches}</p>
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
                  <p className="text-sm font-medium text-gray-600">Progression</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.progressPercentage}%</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
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
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tests récents */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Tests récents
                </CardTitle>
                <CardDescription>
                  Vos derniers résultats de tests d'orientation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{test.name}</p>
                          <p className="text-sm text-gray-500">{test.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {test.score}%
                        </Badge>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Voir tous mes résultats
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Suggestions de carrière */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Suggestions de carrière
                </CardTitle>
                <CardDescription>
                  Basé sur vos résultats de tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {careerSuggestions.map((career, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{career.title}</p>
                          <p className="text-sm text-gray-500">{career.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {career.match}% match
                        </Badge>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prochain rendez-vous */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Prochain rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">15 Janvier 2024</p>
                  <p className="text-sm text-gray-500">Consultation conseiller</p>
                  <Button className="mt-3" size="sm">
                    Voir détails
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tests à venir */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Tests à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-sm text-gray-500">{test.date} • {test.duration}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Commencer
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau test
                </Button>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Nouveau test RIASEC
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Prendre rendez-vous
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Optimiser mon CV
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Conseils personnalisés
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