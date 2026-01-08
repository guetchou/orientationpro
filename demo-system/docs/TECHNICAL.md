# 🔧 Documentation Technique - Système DEMO

## Architecture technique

### Vue d'ensemble
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ DemoOverlay│  │    │ DemoMiddleware│  │    │  demo schema│  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │useDemoMode│  │    │DemoDatabase │  │    │  public schema│  │
│  └───────────┘  │    │  Service    │  │    │  └───────────┘  │
│  ┌───────────┐  │    │                 │    │                 │
│  │DemoProvider│  │    │                 │    │                 │
│  └───────────┘  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Composants principaux

#### Frontend
- **DemoOverlay**: Composant d'interface pour l'overlay DEMO
- **useDemoMode**: Hook React pour la gestion du mode DEMO
- **DemoProvider**: Provider React pour le contexte DEMO
- **DemoIndicator**: Composant pour les indicateurs visuels

#### Backend
- **DemoMiddleware**: Middleware Express pour la détection DEMO
- **DemoDatabaseService**: Service pour la gestion de la base de données DEMO
- **DemoAuditService**: Service pour l'audit des activités DEMO
- **DemoMonitoringService**: Service pour le monitoring DEMO

#### Base de données
- **Schéma demo**: Schéma isolé pour les données de démonstration
- **RLS**: Row Level Security pour l'isolation
- **Audit logs**: Tables de logs pour l'audit
- **Migrations**: Scripts de migration pour le schéma DEMO

## Implémentation technique

### Détection du mode DEMO

#### Headers HTTP
```javascript
// Détection via headers
const isDemoMode = req.headers['x-demo-mode'] === 'true';
```

#### JWT Token
```javascript
// Détection via JWT
const token = req.headers.authorization?.replace('Bearer ', '');
if (token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.demo_mode === true;
}
```

#### Cookies
```javascript
// Détection via cookies
const demoCookie = req.cookies?.demo_mode === 'true';
```

### Isolation des données

#### Middleware de protection
```javascript
// Middleware de protection contre les écritures en production
const protectProduction = (req, res, next) => {
  if (req.isDemoMode && req.method !== 'GET') {
    // Vérifier que l'opération est bien en mode DEMO
    if (req.demoSchema !== 'demo') {
      return res.status(403).json({
        error: 'Écriture en production interdite en mode DEMO'
      });
    }
  }
  next();
};
```

#### RLS (Row Level Security)
```sql
-- Politique de sécurité pour les utilisateurs
CREATE POLICY demo_users_isolation ON demo.users
    FOR ALL USING (schema_name() = 'demo');

-- Politique de sécurité pour les tests
CREATE POLICY demo_tests_isolation ON demo.test_results
    FOR ALL USING (schema_name() = 'demo');
```

### Mock des écritures

#### Simulation des opérations
```javascript
// Mock des opérations de modification
const mockWriteOperation = (req, res, next) => {
  if (req.isDemoMode && req.method !== 'GET') {
    const originalSend = res.send;
    res.send = function(data) {
      console.log(`🔵 [DEMO] Mocked write operation: ${req.method} ${req.path}`);
      return originalSend.call(this, {
        success: true,
        demo_mode: true,
        message: 'Operation simulated in demo mode',
        data: data
      });
    };
  }
  next();
};
```

### Audit des activités

#### Logging des activités
```javascript
// Service d'audit
class DemoAuditService {
  async logActivity(activity) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      user_id: activity.user_id,
      action: activity.action,
      resource: activity.resource,
      demo_mode: true,
      ip: activity.ip,
      user_agent: activity.user_agent
    };
    
    await this.saveAuditLog(auditLog);
  }
}
```

## Configuration

### Variables d'environnement
```bash
# Activation du mode DEMO
DEMO_MODE=true
DEMO_SCHEMA=demo
DEMO_PREFIX=demo_

# Configuration backend
BACKEND_DEMO_MIDDLEWARE=true
BACKEND_MOCK_WRITES=true
BACKEND_LOGGING=true
BACKEND_AUDIT_TRAIL=true

# Configuration frontend
FRONTEND_DEMO_OVERLAY=true
FRONTEND_VISUAL_INDICATORS=true
FRONTEND_ADAPTIVE_BEHAVIOR=true
FRONTEND_DEMO_BADGE=true

# Configuration sécurité
SECURITY_STRICT_ISOLATION=true
SECURITY_NO_PROD_WRITES=true
SECURITY_AUDIT_ACTIVITIES=true
SECURITY_RLS_ENABLED=true

# Configuration monitoring
MONITORING_DEMO_METRICS=true
MONITORING_PERFORMANCE_TRACKING=true
MONITORING_ACTIVITY_LOGGING=true
```

### Configuration de la base de données
```sql
-- Créer le schéma DEMO
CREATE SCHEMA IF NOT EXISTS demo;

-- Activer RLS sur toutes les tables
ALTER TABLE demo.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.blog_posts ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité
CREATE POLICY demo_users_policy ON demo.users
    FOR ALL USING (schema_name() = 'demo');

CREATE POLICY demo_tests_policy ON demo.test_results
    FOR ALL USING (schema_name() = 'demo');

CREATE POLICY demo_blog_policy ON demo.blog_posts
    FOR ALL USING (schema_name() = 'demo');
```

## API Endpoints

### Endpoints DEMO
```javascript
// GET /api/demo/status
// Vérifier le statut du mode DEMO
app.get('/api/demo/status', (req, res) => {
  res.json({
    demo_mode: req.isDemoMode,
    schema: req.demoSchema,
    user_count: demoData.userCount,
    test_count: demoData.testCount
  });
});

// GET /api/demo/data
// Récupérer les données de démonstration
app.get('/api/demo/data', (req, res) => {
  res.json({
    users: demoUsers,
    tests: demoTests,
    blog_posts: demoBlogPosts
  });
});

// POST /api/demo/reset
// Reset du schéma DEMO
app.post('/api/demo/reset', async (req, res) => {
  try {
    await demoDatabaseService.resetDemoSchema();
    await demoDatabaseService.generateDemoData();
    res.json({ success: true, message: 'DEMO reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Tests

### Tests unitaires
```javascript
// Test du middleware DEMO
describe('DemoMiddleware', () => {
  it('should detect demo mode from headers', () => {
    const req = {
      headers: { 'x-demo-mode': 'true' }
    };
    const isDemo = demoMiddleware.detectDemoMode(req);
    expect(isDemo).toBe(true);
  });
});
```

### Tests d'intégration
```javascript
// Test de l'isolation des données
describe('Demo Isolation', () => {
  it('should not write to production in demo mode', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('X-Demo-Mode', 'true')
      .send({ name: 'Test User' });
    
    expect(response.status).toBe(200);
    expect(response.body.demo_mode).toBe(true);
  });
});
```

### Tests de performance
```javascript
// Test de performance en mode DEMO
describe('Demo Performance', () => {
  it('should maintain performance in demo mode', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/api/demo/data')
      .set('X-Demo-Mode', 'true');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // Moins d'1 seconde
  });
});
```

## Monitoring

### Métriques à surveiller
```javascript
// Métriques DEMO
const demoMetrics = {
  activeUsers: 0,
  testCompletions: 0,
  sessionDuration: 0,
  errorRate: 0,
  performanceScore: 0
};

// Collecte des métriques
const collectDemoMetrics = () => {
  // Collecter les métriques en temps réel
  demoMetrics.activeUsers = getActiveDemoUsers();
  demoMetrics.testCompletions = getDemoTestCompletions();
  demoMetrics.sessionDuration = getAverageSessionDuration();
  demoMetrics.errorRate = getDemoErrorRate();
  demoMetrics.performanceScore = getDemoPerformanceScore();
};
```

### Alertes
```javascript
// Configuration des alertes
const demoAlerts = {
  highUsage: {
    threshold: 100,
    message: 'Utilisation élevée du mode DEMO',
    action: 'scaleResources'
  },
  securityBreach: {
    threshold: 1,
    message: 'Tentative d\'écriture en production',
    action: 'blockAccess'
  },
  performance: {
    threshold: 2000,
    message: 'Performance dégradée en mode DEMO',
    action: 'optimizeQueries'
  }
};
```

## Déploiement

### Script de déploiement
```bash
#!/bin/bash
# deploy-demo.sh

echo "🚀 Déploiement du système DEMO..."

# 1. Backup de la production
./backup-production.sh

# 2. Arrêt de l'application
pm2 stop orientationpro

# 3. Mise à jour du code
git pull origin main

# 4. Installation des dépendances
npm install

# 5. Configuration de la base de données
./demo-system/scripts/activate-demo.sh

# 6. Tests de validation
npm run test:demo

# 7. Redémarrage de l'application
pm2 start orientationpro

# 8. Vérification du déploiement
./health-check.sh

echo "✅ Déploiement terminé"
```

### Configuration PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'orientationpro',
    script: 'backend/src/app.js',
    env: {
      NODE_ENV: 'production',
      DEMO_MODE: 'false'
    },
    env_demo: {
      NODE_ENV: 'demo',
      DEMO_MODE: 'true'
    }
  }]
};
```

## Maintenance

### Tâches de maintenance
```bash
# Nettoyage des logs
./demo-system/scripts/cleanup-logs.sh

# Optimisation de la base de données
./demo-system/scripts/optimize-db.sh

# Mise à jour des données de démonstration
./demo-system/scripts/update-demo-data.sh

# Vérification de l'intégrité
./demo-system/scripts/check-integrity.sh
```

### Monitoring continu
```bash
# Surveillance en temps réel
./demo-system/scripts/monitor-demo.sh

# Alertes automatiques
./demo-system/scripts/setup-alerts.sh

# Rapports quotidiens
./demo-system/scripts/daily-report.sh
```
