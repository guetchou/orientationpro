import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  TrendingUp,
  Activity,
  Shield,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Search,
  Bell,
  Menu,
  X,
  Download,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share2,
  Star,
  RefreshCw,
  Zap,
  Target,
  Award,
  TrendingDown,
  DollarSign,
  Globe,
  Smartphone,
  Monitor,
  Command,
  Keyboard,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActivityChart } from '@/components/admin/Charts/ActivityChart';
import { NotificationCenter } from '@/components/admin/Notifications/NotificationCenter';
import { GlobalSearch } from '@/components/admin/Search/GlobalSearch';
import { KeyboardShortcuts } from '@/components/admin/KeyboardShortcuts/KeyboardShortcuts';
import { SmartBreadcrumbs, NavigationContext } from '@/components/admin/Breadcrumbs/SmartBreadcrumbs';
import UsersManagement from './UsersManagement';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTests: number;
  completedTests: number;
  pendingAppointments: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  revenue: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'test_completion' | 'appointment' | 'content_update';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTests: 0,
    completedTests: 0,
    pendingAppointments: 0,
    systemHealth: 'good',
    revenue: 0,
    conversionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  
  // État pour les breadcrumbs
  const [breadcrumbItems, setBreadcrumbItems] = useState([
    { label: 'Dashboard', path: '/admin/dashboard' }
  ]);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculer le nombre de notifications non lues
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Vérifier l'authentification admin
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken && !user) {
      toast.error("Accès non autorisé");
      navigate("/login");
      return;
    }
    
    // Charger les données du dashboard
    loadDashboardData();
    loadNotifications();
  }, [user, navigate]);

  // Gestionnaire de raccourcis clavier global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Raccourcis globaux
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setIsGlobalSearchOpen(true);
            break;
          case 'b':
            e.preventDefault();
            setIsNotificationCenterOpen(true);
            break;
          case '/':
            e.preventDefault();
            setIsKeyboardShortcutsOpen(true);
            break;
          case 'm':
            e.preventDefault();
            setDarkMode(!darkMode);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [darkMode]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simuler un appel API (remplacer par de vrais appels)
      const mockStats: DashboardStats = {
        totalUsers: 1256,
        activeUsers: 892,
        totalTests: 3487,
        completedTests: 3123,
        pendingAppointments: 23,
        systemHealth: 'excellent',
        revenue: 45600,
        conversionRate: 78.5
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registration',
          title: 'Nouvel utilisateur inscrit',
          description: 'Marie Doukaga s\'est inscrite sur la plateforme',
          timestamp: 'Il y a 2 heures',
          status: 'success',
          priority: 'medium'
        },
        {
          id: '2',
          type: 'test_completion',
          title: 'Test RIASEC complété',
          description: 'Jean Batchi a terminé son test d\'orientation',
          timestamp: 'Il y a 3 heures',
          status: 'success',
          priority: 'low'
        },
        {
          id: '3',
          type: 'appointment',
          title: 'Rendez-vous confirmé',
          description: 'Consultation avec Dr. Patel confirmée',
          timestamp: 'Il y a 5 heures',
          status: 'info',
          priority: 'high'
        },
        {
          id: '4',
          type: 'content_update',
          title: 'Nouvel article publié',
          description: '"Choisir son orientation" ajouté au blog',
          timestamp: 'Il y a 8 heures',
          status: 'success',
          priority: 'medium'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nouveau test disponible',
        message: 'Le test d\'intelligence émotionnelle est maintenant disponible',
        type: 'info',
        timestamp: 'Il y a 10 min',
        read: false
      },
      {
        id: '2',
        title: 'Système mis à jour',
        message: 'La plateforme a été mise à jour vers la version 2.1.0',
        type: 'success',
        timestamp: 'Il y a 1 heure',
        read: true
      },
      {
        id: '3',
        title: 'Attention requise',
        message: '5 rendez-vous en attente de confirmation',
        type: 'warning',
        timestamp: 'Il y a 2 heures',
        read: false
      }
    ];
    setNotifications(mockNotifications);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-user':
        toast.info("Ouverture du formulaire de création d'utilisateur...");
        // Ici on pourrait ouvrir une modale de création d'utilisateur
        setTimeout(() => {
          toast.success("Formulaire de création d'utilisateur prêt");
        }, 1000);
        break;
      case 'export-data':
        toast.info("Préparation de l'export des données...");
        // Simulation d'un export
        setTimeout(() => {
          toast.success("Export terminé ! Fichier téléchargé automatiquement");
        }, 2000);
        break;
      case 'system-check':
        toast.info("Vérification du système en cours...");
        // Simulation d'une vérification système
        setTimeout(() => {
          toast.success("Vérification terminée - Système opérationnel");
        }, 1500);
        break;
      case 'backup':
        toast.info("Lancement de la sauvegarde...");
        // Simulation d'une sauvegarde
        setTimeout(() => {
          toast.success("Sauvegarde terminée avec succès");
        }, 3000);
        break;
      case 'add-user':
        toast.info("Ouverture du formulaire d'ajout d'utilisateur...");
        break;
      case 'import-users':
        toast.info("Sélectionnez un fichier CSV à importer...");
        break;
      case 'export-users':
        toast.info("Export de la liste des utilisateurs...");
        setTimeout(() => {
          toast.success("Liste des utilisateurs exportée");
        }, 1500);
        break;
      case 'new-article':
        toast.info("Ouverture de l'éditeur d'articles...");
        break;
      case 'manage-categories':
        toast.info("Ouverture de la gestion des catégories...");
        break;
      case 'schedule-publish':
        toast.info("Planification de publication...");
        break;
      case 'generate-report':
        toast.info("Génération du rapport en cours...");
        setTimeout(() => {
          toast.success("Rapport généré et disponible");
        }, 2000);
        break;
      case 'export-analytics':
        toast.info("Export des données analytics...");
        setTimeout(() => {
          toast.success("Données analytics exportées");
        }, 1500);
        break;
      case 'configure-alerts':
        toast.info("Ouverture de la configuration des alertes...");
        break;
      case 'save-settings':
        toast.info("Sauvegarde des paramètres...");
        setTimeout(() => {
          toast.success("Paramètres sauvegardés");
        }, 1000);
        break;
      case 'restore-settings':
        toast.info("Restauration des paramètres...");
        setTimeout(() => {
          toast.success("Paramètres restaurés");
        }, 1000);
        break;
      case 'export-config':
        toast.info("Export de la configuration...");
        setTimeout(() => {
          toast.success("Configuration exportée");
        }, 1000);
        break;
      default:
        toast.info("Action en cours de développement");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Mettre à jour les breadcrumbs selon l'onglet
    const newBreadcrumbs = [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { 
        label: tab === 'overview' ? 'Vue d\'ensemble' : 
               tab === 'users' ? 'Utilisateurs' :
               tab === 'content' ? 'Contenu' :
               tab === 'analytics' ? 'Analytics' :
               tab === 'settings' ? 'Paramètres' : 'Dashboard',
        path: `/admin/${tab}`
      }
    ];
    setBreadcrumbItems(newBreadcrumbs);
  };

  const handleBreadcrumbNavigate = (path: string) => {
    // Navigation basée sur le path
    if (path.includes('dashboard')) {
      setActiveTab('overview');
    } else if (path.includes('users')) {
      setActiveTab('users');
    } else if (path.includes('content')) {
      setActiveTab('content');
    } else if (path.includes('analytics')) {
      setActiveTab('analytics');
    } else if (path.includes('settings')) {
      setActiveTab('settings');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔐 Déconnexion depuis AdminDashboard...');
      
      // Utiliser le système de déconnexion unifié
      const { signOut } = useAuth();
      await signOut();
      
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer le nettoyage même en cas d'erreur
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  // Données simulées pour le graphique d'activité
  const activityData = [
    { date: '2024-12-10', users: 45, tests: 23, appointments: 12 },
    { date: '2024-12-11', users: 52, tests: 28, appointments: 15 },
    { date: '2024-12-12', users: 48, tests: 25, appointments: 18 },
    { date: '2024-12-13', users: 61, tests: 32, appointments: 22 },
    { date: '2024-12-14', users: 55, tests: 29, appointments: 19 },
    { date: '2024-12-15', users: 67, tests: 35, appointments: 25 },
    { date: '2024-12-16', users: 58, tests: 31, appointments: 21 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'dark:bg-gray-800 dark:border-gray-700' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
            <Button 
              variant={activeTab === "overview" ? "default" : "ghost"} 
              className={`w-full justify-start transition-all duration-200 ${
                activeTab === "overview" 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => handleTabChange("overview")}
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Vue d'ensemble
            </Button>
            <Button 
              variant={activeTab === "users" ? "default" : "ghost"} 
              className={`w-full justify-start transition-all duration-200 ${
                activeTab === "users" 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => handleTabChange("users")}
            >
              <Users className="h-4 w-4 mr-3" />
              Utilisateurs
            </Button>
            <Button 
              variant={activeTab === "content" ? "default" : "ghost"} 
              className={`w-full justify-start transition-all duration-200 ${
                activeTab === "content" 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => handleTabChange("content")}
            >
              <FileText className="h-4 w-4 mr-3" />
              Contenu
            </Button>
            <Button 
              variant={activeTab === "analytics" ? "default" : "ghost"} 
              className={`w-full justify-start transition-all duration-200 ${
                activeTab === "analytics" 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => handleTabChange("analytics")}
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              Analytics
            </Button>
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className={`w-full justify-start transition-all duration-200 ${
                activeTab === "settings" 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => handleTabChange("settings")}
            >
              <Settings className="h-4 w-4 mr-3" />
              Paramètres
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions rapides</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200" 
              onClick={() => handleQuickAction('new-user')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200" 
              onClick={() => handleQuickAction('export-data')}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter données
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200" 
              onClick={() => handleQuickAction('system-check')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Vérification système
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200" 
              onClick={() => handleQuickAction('backup')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sauvegarde
            </Button>
          </div>

          <Separator />

          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compte</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Recherche globale */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGlobalSearchOpen(true)}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Rechercher</span>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Globe className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </Button>

              {/* Raccourcis clavier */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsKeyboardShortcutsOpen(true)}
                className="flex items-center space-x-1"
              >
                <Keyboard className="h-4 w-4" />
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Command className="h-3 w-3" />
                  <span>/</span>
                </div>
              </Button>
              
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              
              <div className="flex items-center space-x-3">
                <Badge className={getHealthColor(stats.systemHealth)}>
                  <Activity className="h-3 w-3 mr-1" />
                  Système: {stats.systemHealth}
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Breadcrumbs intelligents */}
          <div className="mb-6">
            <SmartBreadcrumbs 
              items={breadcrumbItems}
              onNavigate={handleBreadcrumbNavigate}
              showHome={true}
            />
          </div>

          {/* Contexte de navigation */}
          <NavigationContext 
            currentPath={`/admin/${activeTab}`} 
            onAction={handleQuickAction}
          />

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +12% ce mois
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tests complétés</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedTests.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +8% cette semaine
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.revenue.toLocaleString()} €</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +15% ce mois
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                    </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux de conversion</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                    <p className="text-xs text-blue-600 mt-1">
                      <Target className="h-3 w-3 inline mr-1" />
                      Objectif: 80%
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation par onglets */}
          <Tabs defaultValue="overview" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Graphique d'activité */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <ActivityChart data={activityData} period="week" />
                </div>
                <div className="space-y-6">
                  {/* Carte de santé système */}
            <Card>
              <CardHeader>
                      <CardTitle className="text-lg">Santé système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Performance</span>
                          <Badge className={getHealthColor(stats.systemHealth)}>
                            {stats.systemHealth}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Utilisateurs actifs</span>
                          <span className="text-sm font-medium">{stats.activeUsers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rendez-vous en attente</span>
                          <span className="text-sm font-medium">{stats.pendingAppointments}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions rapides */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('new-user')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvel utilisateur
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('export-data')}>
                          <Download className="h-4 w-4 mr-2" />
                          Exporter données
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('system-check')}>
                          <Activity className="h-4 w-4 mr-2" />
                          Vérification système
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activité récente */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Activité récente</CardTitle>
                        <CardDescription>
                          Les dernières actions sur la plateforme
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtrer
                        </Button>
                        <Button variant="outline" size="sm">
                          Voir tout
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className={`border-l-4 pl-4 py-3 ${getStatusColor(activity.status)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(activity.status)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{activity.title}</p>
                                  <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>
                                    {activity.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{activity.timestamp}</span>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                  </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques des tests */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Répartition des tests</CardTitle>
                        <CardDescription>
                          Performance par type de test
                        </CardDescription>
                  </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Test RIASEC', percentage: 45, color: 'bg-blue-500', trend: '+5%' },
                        { name: 'Intelligence émotionnelle', percentage: 25, color: 'bg-green-500', trend: '+12%' },
                        { name: 'Intelligences multiples', percentage: 15, color: 'bg-purple-500', trend: '-2%' },
                        { name: 'Styles d\'apprentissage', percentage: 15, color: 'bg-yellow-500', trend: '+8%' }
                      ].map((test, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{test.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {test.trend}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${test.color}`} 
                                style={{ width: `${test.percentage}%` }}
                              ></div>
                  </div>
                            <span className="text-sm text-gray-600 w-8">{test.percentage}%</span>
                    </div>
                  </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des utilisateurs</CardTitle>
                      <CardDescription>
                        Gérez les comptes utilisateurs et leurs permissions
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrer
                      </Button>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvel utilisateur
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <UsersManagement />
                </CardContent>
              </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
              <CardTitle>Gestion du contenu</CardTitle>
              <CardDescription>
                        Articles, ressources et événements
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrer
                      </Button>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau contenu
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Gestion du contenu
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Interface de gestion du contenu en cours de développement
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir le contenu
                      </Button>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Analytics avancées</CardTitle>
                      <CardDescription>
                        Statistiques détaillées et rapports
              </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                      <Button>
                        <Zap className="h-4 w-4 mr-2" />
                        Générer rapport
                      </Button>
                    </div>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Analytics avancées
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Module d'analytics en cours de développement
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Voir les rapports
                      </Button>
                      <Button variant="outline">
                        <Target className="h-4 w-4 mr-2" />
                        Objectifs
                      </Button>
                    </div>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
              <CardTitle>Paramètres du système</CardTitle>
              <CardDescription>
                Configuration globale de la plateforme
              </CardDescription>
                    </div>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Paramètres système
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Interface de configuration en cours de développement
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Configurer
                      </Button>
                      <Button variant="outline">
                        <Star className="h-4 w-4 mr-2" />
                        Favoris
                      </Button>
                    </div>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>

      {/* Composants modaux */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
      
      <GlobalSearch 
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      <KeyboardShortcuts 
        isOpen={isKeyboardShortcutsOpen}
        onClose={() => setIsKeyboardShortcutsOpen(false)}
      />
    </div>
  );
}
