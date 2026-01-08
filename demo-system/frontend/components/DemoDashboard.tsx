import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Shield,
  Database,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { useDemoMode } from '../hooks/useDemoMode';

interface DemoMetrics {
  activeUsers: number;
  testCompletions: number;
  sessionDuration: number;
  errorRate: number;
  performanceScore: number;
  securityBreaches: number;
  demoSessions: number;
}

interface DemoAlert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

const DemoDashboard: React.FC = () => {
  const { isDemoMode } = useDemoMode();
  const [metrics, setMetrics] = useState<DemoMetrics | null>(null);
  const [alerts, setAlerts] = useState<DemoAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
      const interval = setInterval(loadDemoData, 30000); // Rafraîchir toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [isDemoMode]);

  const loadDemoData = async () => {
    try {
      const response = await fetch('/api/demo/monitoring', {
        headers: {
          'X-Demo-Mode': 'true'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setAlerts(data.alerts);
      } else {
        // Données simulées si l'API n'est pas disponible
        setMetrics({
          activeUsers: 25,
          testCompletions: 45,
          sessionDuration: 15,
          errorRate: 2.5,
          performanceScore: 92,
          securityBreaches: 0,
          demoSessions: 8
        });
        setAlerts([
          {
            type: 'info',
            severity: 'info',
            message: 'Mode DEMO actif - Données simulées',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur chargement données DEMO:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts,
      summary: {
        totalSessions: metrics?.demoSessions || 0,
        totalTests: metrics?.testCompletions || 0,
        averageSessionDuration: metrics?.sessionDuration || 0,
        errorRate: metrics?.errorRate || 0,
        securityBreaches: metrics?.securityBreaches || 0
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demo-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isDemoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Dashboard DEMO</span>
              </CardTitle>
              <CardDescription>
                Le dashboard DEMO n'est disponible qu'en mode démonstration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Activez le mode DEMO pour accéder au dashboard de monitoring.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard DEMO
              </h1>
              <p className="text-gray-600">
                Monitoring en temps réel du système de démonstration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Database className="h-4 w-4 mr-1" />
                Mode DEMO
              </Badge>
              <Button onClick={loadDemoData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% par rapport à hier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tests complétés</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.testCompletions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% par rapport à hier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Durée session</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.sessionDuration || 0} min</div>
                  <p className="text-xs text-muted-foreground">
                    Moyenne par session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.performanceScore || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Score global
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>
                    Évolution de l'activité sur les dernières 24h
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Graphique d'activité (simulé)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition des tests</CardTitle>
                  <CardDescription>
                    Types de tests les plus populaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Graphique de répartition (simulé)
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métriques détaillées</CardTitle>
                <CardDescription>
                  Toutes les métriques du système DEMO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Utilisateurs actifs</span>
                      <Badge variant="secondary">{metrics?.activeUsers || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessions DEMO</span>
                      <Badge variant="secondary">{metrics?.demoSessions || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tests complétés</span>
                      <Badge variant="secondary">{metrics?.testCompletions || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Durée session moyenne</span>
                      <Badge variant="secondary">{metrics?.sessionDuration || 0} min</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Taux d'erreur</span>
                      <Badge variant="secondary">{metrics?.errorRate || 0}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Score performance</span>
                      <Badge variant="secondary">{metrics?.performanceScore || 0}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Violations sécurité</span>
                      <Badge variant="secondary">{metrics?.securityBreaches || 0}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertes système</CardTitle>
                <CardDescription>
                  Alertes et notifications en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>Aucune alerte active</p>
                    </div>
                  ) : (
                    alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">{alert.message}</span>
                        </div>
                        <p className="text-sm mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs d'activité</CardTitle>
                <CardDescription>
                  Journal des activités DEMO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                    [2024-01-15 10:30:15] Utilisateur demo.user@example.com a complété le test RIASEC
                  </div>
                  <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                    [2024-01-15 10:28:42] Nouvelle session DEMO démarrée
                  </div>
                  <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                    [2024-01-15 10:25:18] Utilisateur demo.admin@example.com a accédé au dashboard
                  </div>
                  <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                    [2024-01-15 10:22:33] Test émotionnel démarré par demo.user@example.com
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DemoDashboard;
