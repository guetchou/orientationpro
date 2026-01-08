#!/bin/bash

echo "📊 Création du Système de Monitoring DEMO"
echo "========================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEMO_SYSTEM="/opt/orientationpro/demo-system"

# Service de monitoring DEMO
cat > $DEMO_SYSTEM/backend/services/demoMonitoringService.js << 'EOF'
const config = require('../../config');

class DemoMonitoringService {
  constructor() {
    this.metrics = {
      activeUsers: 0,
      testCompletions: 0,
      sessionDuration: 0,
      errorRate: 0,
      performanceScore: 0,
      securityBreaches: 0,
      demoSessions: 0
    };
    
    this.alerts = [];
    this.logs = [];
  }

  /**
   * Collecte les métriques en temps réel
   */
  async collectMetrics() {
    try {
      // Métriques utilisateurs
      this.metrics.activeUsers = await this.getActiveDemoUsers();
      this.metrics.demoSessions = await this.getDemoSessions();
      
      // Métriques tests
      this.metrics.testCompletions = await this.getDemoTestCompletions();
      
      // Métriques performance
      this.metrics.sessionDuration = await this.getAverageSessionDuration();
      this.metrics.performanceScore = await this.getPerformanceScore();
      
      // Métriques sécurité
      this.metrics.errorRate = await this.getDemoErrorRate();
      this.metrics.securityBreaches = await this.getSecurityBreaches();
      
      console.log('📊 Métriques DEMO collectées:', this.metrics);
      return this.metrics;
    } catch (error) {
      console.error('❌ Erreur collecte métriques:', error.message);
      throw error;
    }
  }

  /**
   * Vérifie les alertes
   */
  async checkAlerts() {
    const newAlerts = [];
    
    // Alerte utilisation élevée
    if (this.metrics.activeUsers > 100) {
      newAlerts.push({
        type: 'high_usage',
        severity: 'warning',
        message: `Utilisation élevée du mode DEMO: ${this.metrics.activeUsers} utilisateurs actifs`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Alerte sécurité
    if (this.metrics.securityBreaches > 0) {
      newAlerts.push({
        type: 'security_breach',
        severity: 'critical',
        message: `${this.metrics.securityBreaches} tentative(s) d'accès non autorisé`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Alerte performance
    if (this.metrics.performanceScore < 80) {
      newAlerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Performance dégradée: ${this.metrics.performanceScore}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    this.alerts = [...this.alerts, ...newAlerts];
    return newAlerts;
  }

  /**
   * Génère un rapport de monitoring
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      alerts: this.alerts,
      logs: this.logs.slice(-100), // Derniers 100 logs
      summary: {
        totalSessions: this.metrics.demoSessions,
        totalTests: this.metrics.testCompletions,
        averageSessionDuration: this.metrics.sessionDuration,
        errorRate: this.metrics.errorRate,
        securityBreaches: this.metrics.securityBreaches
      }
    };
    
    return report;
  }

  /**
   * Log une activité DEMO
   */
  logActivity(activity) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user_id: activity.user_id || 'anonymous',
      action: activity.action,
      resource: activity.resource,
      demo_mode: true,
      ip: activity.ip,
      user_agent: activity.user_agent,
      session_id: activity.session_id
    };
    
    this.logs.push(logEntry);
    
    // Limiter la taille des logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }
    
    console.log('🔵 [DEMO LOG]', logEntry);
  }

  /**
   * Méthodes privées pour collecter les métriques
   */
  async getActiveDemoUsers() {
    // Simulation - en production, requête à la base de données
    return Math.floor(Math.random() * 50) + 10;
  }

  async getDemoSessions() {
    // Simulation - en production, requête à la base de données
    return Math.floor(Math.random() * 20) + 5;
  }

  async getDemoTestCompletions() {
    // Simulation - en production, requête à la base de données
    return Math.floor(Math.random() * 100) + 20;
  }

  async getAverageSessionDuration() {
    // Simulation - en production, calcul basé sur les logs
    return Math.floor(Math.random() * 30) + 10; // minutes
  }

  async getPerformanceScore() {
    // Simulation - en production, calcul basé sur les métriques
    return Math.floor(Math.random() * 20) + 80; // pourcentage
  }

  async getDemoErrorRate() {
    // Simulation - en production, calcul basé sur les erreurs
    return Math.random() * 5; // pourcentage
  }

  async getSecurityBreaches() {
    // Simulation - en production, comptage des tentatives
    return Math.floor(Math.random() * 3);
  }
}

module.exports = new DemoMonitoringService();
EOF

# Dashboard de monitoring DEMO
cat > $DEMO_SYSTEM/frontend/components/DemoDashboard.tsx << 'EOF'
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
EOF

# Scripts de test DEMO
cat > $DEMO_SYSTEM/scripts/test-demo-system.sh << 'EOF'
#!/bin/bash

echo "🧪 Test du Système DEMO"
echo "======================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://localhost:8045"
BACKEND_URL="http://localhost:7474"
DEMO_SYSTEM="/opt/orientationpro/demo-system"

# Fonction pour tester une route
test_route() {
    local route=$1
    local description=$2
    local expected_status=$3
    
    echo -e "${BLUE}🔍 Test de $route ($description)...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$route")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ $route - HTTP $response${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $route - HTTP $response (attendu: $expected_status)${NC}"
        return 1
    fi
}

# Fonction pour tester une API
test_api() {
    local endpoint=$1
    local description=$2
    local demo_header=$3
    
    echo -e "${BLUE}🔍 Test API $endpoint ($description)...${NC}"
    
    headers=""
    if [ "$demo_header" = "true" ]; then
        headers="-H 'X-Demo-Mode: true'"
    fi
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $headers "$BACKEND_URL$endpoint")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "  ${GREEN}✅ $endpoint - HTTP $response${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $endpoint - HTTP $response${NC}"
        return 1
    fi
}

echo -e "${YELLOW}🚀 Démarrage des tests du système DEMO...${NC}"
echo ""

# 1. Test de l'activation du mode DEMO
echo -e "${YELLOW}📋 Test 1: Activation du mode DEMO${NC}"
echo "=================================="

# Activer le mode DEMO
cd $DEMO_SYSTEM/scripts
./activate-demo.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mode DEMO activé${NC}"
else
    echo -e "${RED}❌ Erreur activation mode DEMO${NC}"
    exit 1
fi

echo ""

# 2. Test des routes frontend en mode DEMO
echo -e "${YELLOW}📋 Test 2: Routes frontend en mode DEMO${NC}"
echo "=============================================="

# Vérifier que le serveur frontend est accessible
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Serveur frontend accessible${NC}"
else
    echo -e "${RED}❌ Serveur frontend non accessible${NC}"
    echo -e "${YELLOW}💡 Démarrez le serveur: cd frontend && npm run dev${NC}"
    exit 1
fi

# Routes à tester en mode DEMO
demo_routes=(
    "/:Accueil DEMO:200"
    "/login:Connexion DEMO:200"
    "/tests:Tests DEMO:200"
    "/tests/riasec:Test RIASEC DEMO:200"
    "/dashboard:Dashboard DEMO:200"
    "/admin/dashboard:Admin DEMO:200"
)

success_count=0
total_count=0

for route_info in "${demo_routes[@]}"; do
    IFS=':' read -r route description expected_status <<< "$route_info"
    total_count=$((total_count + 1))
    
    if test_route "$route" "$description" "$expected_status"; then
        success_count=$((success_count + 1))
    fi
    echo ""
done

echo ""

# 3. Test des APIs backend en mode DEMO
echo -e "${YELLOW}📋 Test 3: APIs backend en mode DEMO${NC}"
echo "=========================================="

# APIs à tester
demo_apis=(
    "/api/demo/status:Statut DEMO:true"
    "/api/demo/data:Données DEMO:true"
    "/api/auth/login:Connexion:false"
    "/api/tests:Tests:false"
)

for api_info in "${demo_apis[@]}"; do
    IFS=':' read -r endpoint description demo_header <<< "$api_info"
    total_count=$((total_count + 1))
    
    if test_api "$endpoint" "$description" "$demo_header"; then
        success_count=$((success_count + 1))
    fi
    echo ""
done

echo ""

# 4. Test de l'isolation des données
echo -e "${YELLOW}📋 Test 4: Isolation des données${NC}"
echo "================================"

# Test d'écriture en mode DEMO
echo -e "${BLUE}🔍 Test d'écriture en mode DEMO...${NC}"
write_response=$(curl -s -X POST -H "Content-Type: application/json" -H "X-Demo-Mode: true" \
  -d '{"test": "data"}' "$BACKEND_URL/api/demo/test-write")

if echo "$write_response" | grep -q "demo_mode.*true"; then
    echo -e "  ${GREEN}✅ Écriture simulée en mode DEMO${NC}"
    success_count=$((success_count + 1))
else
    echo -e "  ${RED}❌ Écriture non simulée en mode DEMO${NC}"
fi
total_count=$((total_count + 1))

echo ""

# 5. Test de la base de données DEMO
echo -e "${YELLOW}📋 Test 5: Base de données DEMO${NC}"
echo "================================="

# Vérifier que le schéma DEMO existe
schema_check=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'demo';")

if [ -n "$schema_check" ]; then
    echo -e "${GREEN}✅ Schéma DEMO existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Schéma DEMO n'existe pas${NC}"
fi
total_count=$((total_count + 1))

# Vérifier les données de démonstration
demo_users=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.users;")

if [ "$demo_users" -gt 0 ]; then
    echo -e "${GREEN}✅ Données de démonstration présentes ($demo_users utilisateurs)${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Aucune donnée de démonstration${NC}"
fi
total_count=$((total_count + 1))

echo ""

# 6. Test des composants frontend
echo -e "${YELLOW}📋 Test 6: Composants frontend DEMO${NC}"
echo "=========================================="

# Vérifier que les composants DEMO existent
if [ -f "$DEMO_SYSTEM/frontend/components/DemoOverlay.tsx" ]; then
    echo -e "${GREEN}✅ Composant DemoOverlay existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Composant DemoOverlay manquant${NC}"
fi
total_count=$((total_count + 1))

if [ -f "$DEMO_SYSTEM/frontend/hooks/useDemoMode.ts" ]; then
    echo -e "${GREEN}✅ Hook useDemoMode existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Hook useDemoMode manquant${NC}"
fi
total_count=$((total_count + 1))

if [ -f "$DEMO_SYSTEM/frontend/components/DemoDashboard.tsx" ]; then
    echo -e "${GREEN}✅ Composant DemoDashboard existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Composant DemoDashboard manquant${NC}"
fi
total_count=$((total_count + 1))

echo ""

# 7. Test des scripts de gestion
echo -e "${YELLOW}📋 Test 7: Scripts de gestion${NC}"
echo "================================"

# Vérifier que les scripts existent et sont exécutables
scripts=("activate-demo.sh" "deactivate-demo.sh" "reset-demo.sh" "backup-demo.sh")

for script in "${scripts[@]}"; do
    if [ -x "$DEMO_SYSTEM/scripts/$script" ]; then
        echo -e "${GREEN}✅ Script $script existe et est exécutable${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌ Script $script manquant ou non exécutable${NC}"
    fi
    total_count=$((total_count + 1))
done

echo ""

# 8. Test de la documentation
echo -e "${YELLOW}📋 Test 8: Documentation${NC}"
echo "========================"

# Vérifier que la documentation existe
docs=("README.md" "ADMIN.md" "USER.md" "TECHNICAL.md")

for doc in "${docs[@]}"; do
    if [ -f "$DEMO_SYSTEM/docs/$doc" ]; then
        echo -e "${GREEN}✅ Documentation $doc existe${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌ Documentation $doc manquante${NC}"
    fi
    total_count=$((total_count + 1))
done

echo ""
echo -e "${YELLOW}📊 Résumé des Tests:${NC}"
echo "========================"
echo -e "${BLUE}Total des tests: $total_count${NC}"
echo -e "${GREEN}Tests réussis: $success_count${NC}"
echo -e "${RED}Tests échoués: $((total_count - success_count))${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 Tous les tests du système DEMO sont réussis !${NC}"
else
    echo -e "${YELLOW}⚠️ Certains tests nécessitent une attention${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "1. Vérifier les tests échoués"
echo "2. Corriger les problèmes identifiés"
echo "3. Relancer les tests"
echo "4. Déployer en production"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Guide complet: $DEMO_SYSTEM/docs/README.md"
echo "• Guide admin: $DEMO_SYSTEM/docs/ADMIN.md"
echo "• Guide utilisateur: $DEMO_SYSTEM/docs/USER.md"
EOF

# Script de monitoring en temps réel
cat > $DEMO_SYSTEM/scripts/monitor-demo.sh << 'EOF'
#!/bin/bash

echo "📊 Monitoring DEMO en Temps Réel"
echo "================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://localhost:8045"
BACKEND_URL="http://localhost:7474"
LOG_FILE="/tmp/demo-monitoring.log"

# Fonction pour afficher les métriques
show_metrics() {
    clear
    echo -e "${BLUE}📊 Monitoring DEMO - $(date)${NC}"
    echo "=========================================="
    echo ""
    
    # Métriques système
    echo -e "${YELLOW}🖥️  Système:${NC}"
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    echo -e "  CPU: ${cpu_usage}%"
    echo -e "  RAM: ${memory_usage}%"
    echo -e "  Disque: ${disk_usage}%"
    echo ""
    
    # Métriques réseau
    echo -e "${YELLOW}🌐 Réseau:${NC}"
    if curl -s "$FRONTEND_URL" > /dev/null; then
        echo -e "  Frontend: ${GREEN}✅ En ligne${NC}"
    else
        echo -e "  Frontend: ${RED}❌ Hors ligne${NC}"
    fi
    
    if curl -s "$BACKEND_URL" > /dev/null; then
        echo -e "  Backend: ${GREEN}✅ En ligne${NC}"
    else
        echo -e "  Backend: ${RED}❌ Hors ligne${NC}"
    fi
    echo ""
    
    # Métriques DEMO
    echo -e "${YELLOW}🔵 DEMO:${NC}"
    demo_users=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.users WHERE last_active > NOW() - INTERVAL '5 minutes';" 2>/dev/null || echo "0")
    demo_sessions=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.sessions WHERE created_at > NOW() - INTERVAL '1 hour';" 2>/dev/null || echo "0")
    demo_tests=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.test_results WHERE created_at > NOW() - INTERVAL '1 hour';" 2>/dev/null || echo "0")
    
    echo -e "  Utilisateurs actifs: ${demo_users}"
    echo -e "  Sessions (1h): ${demo_sessions}"
    echo -e "  Tests (1h): ${demo_tests}"
    echo ""
    
    # Alertes
    echo -e "${YELLOW}🚨 Alertes:${NC}"
    if [ "$cpu_usage" -gt 80 ]; then
        echo -e "  ${RED}⚠️  CPU élevé: ${cpu_usage}%${NC}"
    fi
    
    if [ "$memory_usage" -gt 80 ]; then
        echo -e "  ${RED}⚠️  RAM élevée: ${memory_usage}%${NC}"
    fi
    
    if [ "$disk_usage" -gt 80 ]; then
        echo -e "  ${RED}⚠️  Disque plein: ${disk_usage}%${NC}"
    fi
    
    if [ "$demo_users" -gt 50 ]; then
        echo -e "  ${PURPLE}📈 Utilisation DEMO élevée: ${demo_users} utilisateurs${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💡 Appuyez sur Ctrl+C pour arrêter${NC}"
}

# Fonction pour logger les événements
log_event() {
    local event=$1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $event" >> "$LOG_FILE"
}

# Boucle de monitoring
echo -e "${GREEN}🚀 Démarrage du monitoring DEMO...${NC}"
echo -e "${BLUE}📝 Logs: $LOG_FILE${NC}"
echo ""

while true; do
    show_metrics
    
    # Log des métriques importantes
    log_event "Monitoring check completed"
    
    # Attendre 5 secondes
    sleep 5
done
EOF

# Rendre les scripts exécutables
chmod +x $DEMO_SYSTEM/scripts/test-demo-system.sh
chmod +x $DEMO_SYSTEM/scripts/monitor-demo.sh

echo -e "${GREEN}✅ Système de monitoring DEMO créé${NC}"
echo ""
echo -e "${YELLOW}📋 Scripts disponibles:${NC}"
echo "• test-demo-system.sh - Tests complets du système DEMO"
echo "• monitor-demo.sh - Monitoring en temps réel"
echo ""
echo -e "${BLUE}💡 Utilisation:${NC}"
echo "• Tests: ./demo-system/scripts/test-demo-system.sh"
echo "• Monitoring: ./demo-system/scripts/monitor-demo.sh" 