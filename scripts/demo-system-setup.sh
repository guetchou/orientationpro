#!/bin/bash

echo "🚀 Configuration du Système DEMO Intégré"
echo "========================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/opt/orientationpro"
DEMO_SCHEMA="demo"
PROD_SCHEMA="public"
DEMO_PREFIX="demo_"

echo -e "${BLUE}📋 Configuration du projet...${NC}"
echo "• Projet: $PROJECT_ROOT"
echo "• Schéma DEMO: $DEMO_SCHEMA"
echo "• Schéma PROD: $PROD_SCHEMA"
echo "• Préfixe DEMO: $DEMO_PREFIX"

# Créer la structure des dossiers
echo -e "${YELLOW}📁 Création de la structure des dossiers...${NC}"
mkdir -p $PROJECT_ROOT/demo-system/{backend,frontend,database,scripts,docs}
mkdir -p $PROJECT_ROOT/demo-system/backend/{middleware,controllers,services,utils}
mkdir -p $PROJECT_ROOT/demo-system/frontend/{components,hooks,utils,styles}
mkdir -p $PROJECT_ROOT/demo-system/database/{migrations,seeds,backups}
mkdir -p $PROJECT_ROOT/demo-system/scripts/{deployment,maintenance,monitoring}

echo -e "${GREEN}✅ Structure des dossiers créée${NC}"

# Créer le fichier de configuration principal
cat > $PROJECT_ROOT/demo-system/config.js << 'EOF'
module.exports = {
  // Configuration générale
  demo: {
    schema: 'demo',
    prefix: 'demo_',
    enabled: process.env.DEMO_MODE === 'true',
    audit: true,
    isolation: true
  },
  
  // Configuration base de données
  database: {
    prod_schema: 'public',
    demo_schema: 'demo',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'orientationpro',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    }
  },
  
  // Configuration backend
  backend: {
    demo_middleware: true,
    mock_writes: true,
    logging: true,
    audit_trail: true
  },
  
  // Configuration frontend
  frontend: {
    demo_overlay: true,
    visual_indicators: true,
    adaptive_behavior: true,
    demo_badge: true
  },
  
  // Configuration sécurité
  security: {
    strict_isolation: true,
    no_prod_writes: true,
    audit_activities: true,
    rls_enabled: true
  },
  
  // Configuration monitoring
  monitoring: {
    demo_metrics: true,
    performance_tracking: true,
    activity_logging: true
  }
};
EOF

echo -e "${GREEN}✅ Configuration principale créée${NC}"

# Créer le middleware DEMO pour le backend
cat > $PROJECT_ROOT/demo-system/backend/middleware/demoMiddleware.js << 'EOF'
const config = require('../../config');

/**
 * Middleware DEMO - Gestion du mode démo
 */
class DemoMiddleware {
  constructor() {
    this.isDemoMode = false;
    this.demoSchema = config.demo.schema;
    this.prodSchema = config.database.prod_schema;
  }

  /**
   * Détecte le mode DEMO via headers ou JWT
   */
  detectDemoMode(req) {
    // Vérifier le header X-Demo-Mode
    if (req.headers['x-demo-mode'] === 'true') {
      return true;
    }

    // Vérifier le JWT pour le mode DEMO
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.demo_mode === true;
      } catch (error) {
        // Token invalide, continuer en mode normal
      }
    }

    // Vérifier le cookie demo_mode
    if (req.cookies?.demo_mode === 'true') {
      return true;
    }

    return false;
  }

  /**
   * Applique le mode DEMO à la requête
   */
  apply(req, res, next) {
    const isDemo = this.detectDemoMode(req);
    
    // Ajouter les informations DEMO à la requête
    req.isDemoMode = isDemo;
    req.demoSchema = isDemo ? this.demoSchema : this.prodSchema;
    req.demoPrefix = isDemo ? config.demo.prefix : '';
    
    // Log de l'activité DEMO
    if (isDemo && config.backend.logging) {
      console.log(`🔵 [DEMO] ${req.method} ${req.path} - User: ${req.user?.id || 'anonymous'}`);
    }
    
    next();
  }

  /**
   * Middleware pour les écritures en mode DEMO
   */
  handleWrites(req, res, next) {
    if (req.isDemoMode && config.backend.mock_writes) {
      // En mode DEMO, simuler les écritures
      const originalSend = res.send;
      res.send = function(data) {
        if (req.method !== 'GET') {
          console.log(`🔵 [DEMO] Mocked write operation: ${req.method} ${req.path}`);
          // Retourner une réponse simulée
          return originalSend.call(this, {
            success: true,
            demo_mode: true,
            message: 'Operation simulated in demo mode',
            data: data
          });
        }
        return originalSend.call(this, data);
      };
    }
    next();
  }

  /**
   * Audit des activités DEMO
   */
  auditActivity(req, res, next) {
    if (req.isDemoMode && config.security.audit_activities) {
      const auditData = {
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || 'anonymous',
        method: req.method,
        path: req.path,
        demo_mode: true,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      };
      
      // Log de l'audit
      console.log(`🔵 [DEMO AUDIT] ${JSON.stringify(auditData)}`);
      
      // Stocker en base si nécessaire
      // this.saveAuditLog(auditData);
    }
    next();
  }
}

module.exports = new DemoMiddleware();
EOF

echo -e "${GREEN}✅ Middleware DEMO créé${NC}"

# Créer le service de gestion de la base de données DEMO
cat > $PROJECT_ROOT/demo-system/backend/services/demoDatabaseService.js << 'EOF'
const { Pool } = require('pg');
const config = require('../../config');

class DemoDatabaseService {
  constructor() {
    this.pool = new Pool(config.database.connection);
    this.demoSchema = config.demo.schema;
    this.prodSchema = config.database.prod_schema;
  }

  /**
   * Crée le schéma DEMO
   */
  async createDemoSchema() {
    const client = await this.pool.connect();
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${this.demoSchema}`);
      console.log(`✅ Schéma ${this.demoSchema} créé`);
    } catch (error) {
      console.error(`❌ Erreur création schéma: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Clone la structure de la production vers DEMO
   */
  async cloneProductionStructure() {
    const client = await this.pool.connect();
    try {
      // Récupérer toutes les tables de la production
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '${this.prodSchema}' 
        AND table_type = 'BASE TABLE'
      `;
      
      const { rows: tables } = await client.query(tablesQuery);
      
      for (const table of tables) {
        const tableName = table.table_name;
        
        // Récupérer la structure de la table
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = '${this.prodSchema}' 
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `;
        
        const { rows: columns } = await client.query(structureQuery);
        
        // Créer la table dans le schéma DEMO
        const createTableQuery = this.buildCreateTableQuery(tableName, columns);
        await client.query(createTableQuery);
        
        console.log(`✅ Table ${tableName} clonée vers ${this.demoSchema}`);
      }
    } catch (error) {
      console.error(`❌ Erreur clonage structure: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Génère des données de démonstration
   */
  async generateDemoData() {
    const client = await this.pool.connect();
    try {
      // Données utilisateurs de démonstration
      const demoUsers = [
        {
          email: 'demo.user@example.com',
          password: '$2b$10$demo.hash',
          role: 'user',
          name: 'Utilisateur Démo',
          created_at: new Date()
        },
        {
          email: 'demo.admin@example.com',
          password: '$2b$10$demo.hash',
          role: 'admin',
          name: 'Admin Démo',
          created_at: new Date()
        },
        {
          email: 'demo.conseiller@example.com',
          password: '$2b$10$demo.hash',
          role: 'conseiller',
          name: 'Conseiller Démo',
          created_at: new Date()
        }
      ];

      // Insérer les utilisateurs de démonstration
      for (const user of demoUsers) {
        await client.query(`
          INSERT INTO ${this.demoSchema}.users (email, password, role, name, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
        `, [user.email, user.password, user.role, user.name, user.created_at]);
      }

      // Générer des données de tests
      await this.generateDemoTestData(client);
      
      // Générer des données de blog
      await this.generateDemoBlogData(client);
      
      console.log(`✅ Données de démonstration générées`);
    } catch (error) {
      console.error(`❌ Erreur génération données: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Génère des données de tests de démonstration
   */
  async generateDemoTestData(client) {
    const testTypes = ['riasec', 'emotional', 'learning', 'multiple', 'career-transition'];
    
    for (const testType of testTypes) {
      for (let i = 1; i <= 5; i++) {
        await client.query(`
          INSERT INTO ${this.demoSchema}.test_results (
            user_id, test_type, score, answers, created_at
          ) VALUES (
            (SELECT id FROM ${this.demoSchema}.users WHERE email = 'demo.user@example.com'),
            $1, $2, $3, $4
          )
        `, [
          testType,
          Math.floor(Math.random() * 100),
          JSON.stringify({ demo: true, answers: Array(20).fill().map(() => Math.floor(Math.random() * 5)) }),
          new Date()
        ]);
      }
    }
  }

  /**
   * Génère des données de blog de démonstration
   */
  async generateDemoBlogData(client) {
    const demoPosts = [
      {
        title: 'Guide de l\'orientation professionnelle en 2024',
        content: 'Contenu de démonstration pour le blog...',
        slug: 'guide-orientation-2024',
        author_id: 1,
        status: 'published'
      },
      {
        title: 'Les métiers du numérique au Congo',
        content: 'Contenu de démonstration pour le blog...',
        slug: 'metiers-numerique-congo',
        author_id: 1,
        status: 'published'
      }
    ];

    for (const post of demoPosts) {
      await client.query(`
        INSERT INTO ${this.demoSchema}.blog_posts (
          title, content, slug, author_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [post.title, post.content, post.slug, post.author_id, post.status, new Date()]);
    }
  }

  /**
   * Construit la requête de création de table
   */
  buildCreateTableQuery(tableName, columns) {
    const columnDefinitions = columns.map(col => {
      let definition = `${col.column_name} ${col.data_type}`;
      
      if (col.is_nullable === 'NO') {
        definition += ' NOT NULL';
      }
      
      if (col.column_default) {
        definition += ` DEFAULT ${col.column_default}`;
      }
      
      return definition;
    }).join(', ');
    
    return `CREATE TABLE IF NOT EXISTS ${this.demoSchema}.${tableName} (${columnDefinitions})`;
  }

  /**
   * Reset complet du schéma DEMO
   */
  async resetDemoSchema() {
    const client = await this.pool.connect();
    try {
      await client.query(`DROP SCHEMA IF EXISTS ${this.demoSchema} CASCADE`);
      await client.query(`CREATE SCHEMA ${this.demoSchema}`);
      console.log(`✅ Schéma ${this.demoSchema} reset`);
    } catch (error) {
      console.error(`❌ Erreur reset schéma: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Sauvegarde du schéma DEMO
   */
  async backupDemoSchema() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${__dirname}/../../database/backups/demo_backup_${timestamp}.sql`;
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync(`pg_dump -h ${config.database.connection.host} -U ${config.database.connection.user} -d ${config.database.connection.database} -n ${this.demoSchema} > ${backupPath}`);
      console.log(`✅ Sauvegarde DEMO créée: ${backupPath}`);
    } catch (error) {
      console.error(`❌ Erreur sauvegarde: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DemoDatabaseService();
EOF

echo -e "${GREEN}✅ Service base de données DEMO créé${NC}"

# Créer le composant frontend pour l'overlay DEMO
cat > $PROJECT_ROOT/demo-system/frontend/components/DemoOverlay.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Info, 
  Shield, 
  Database,
  Users,
  Activity
} from 'lucide-react';
import { useDemoMode } from '../hooks/useDemoMode';

interface DemoOverlayProps {
  children: React.ReactNode;
}

export const DemoOverlay: React.FC<DemoOverlayProps> = ({ children }) => {
  const { isDemoMode, demoData, toggleDemoMode } = useDemoMode();
  const [isVisible, setIsVisible] = useState(true);

  if (!isDemoMode) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Overlay DEMO */}
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Database className="h-5 w-5" />
              <span className="font-bold">MODE DÉMONSTRATION</span>
              <Badge variant="secondary" className="bg-white text-blue-600">
                {demoData?.userCount || 0} utilisateurs
              </Badge>
              <Badge variant="secondary" className="bg-white text-purple-600">
                {demoData?.testCount || 0} tests
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsVisible(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Masquer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleDemoMode}
                className="bg-red-600/20 border-red-400/30 text-white hover:bg-red-600/30"
              >
                <Shield className="h-4 w-4 mr-1" />
                Quitter DEMO
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur flottant */}
      {!isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVisible(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            Afficher DEMO
          </Button>
        </div>
      )}

      {/* Contenu principal avec overlay */}
      <div className={isDemoMode ? 'opacity-90' : ''}>
        {children}
      </div>

      {/* Badges DEMO sur les éléments interactifs */}
      {isDemoMode && (
        <div className="fixed bottom-4 left-4 z-40">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Mode démonstration actif - Aucune donnée réelle modifiée
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default DemoOverlay;
EOF

echo -e "${GREEN}✅ Composant overlay DEMO créé${NC}"

# Créer le hook pour la gestion du mode DEMO
cat > $PROJECT_ROOT/demo-system/frontend/hooks/useDemoMode.ts << 'EOF'
import { useState, useEffect, createContext, useContext } from 'react';

interface DemoData {
  userCount: number;
  testCount: number;
  lastActivity: string;
  demoSessionId: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoData: DemoData | null;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
  getDemoIndicator: () => React.ReactNode;
}

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoData, setDemoData] = useState<DemoData | null>(null);

  // Détecter le mode DEMO au chargement
  useEffect(() => {
    const detectDemoMode = () => {
      // Vérifier le localStorage
      const storedDemoMode = localStorage.getItem('demo_mode');
      if (storedDemoMode === 'true') {
        setIsDemoMode(true);
        return;
      }

      // Vérifier les cookies
      const demoCookie = document.cookie.includes('demo_mode=true');
      if (demoCookie) {
        setIsDemoMode(true);
        return;
      }

      // Vérifier les headers (pour les requêtes API)
      const demoHeader = document.querySelector('meta[name="demo-mode"]');
      if (demoHeader?.getAttribute('content') === 'true') {
        setIsDemoMode(true);
      }
    };

    detectDemoMode();
  }, []);

  // Charger les données de démonstration
  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    }
  }, [isDemoMode]);

  const loadDemoData = async () => {
    try {
      const response = await fetch('/api/demo/data', {
        headers: {
          'X-Demo-Mode': 'true'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDemoData(data);
      }
    } catch (error) {
      console.log('Mode démo: données simulées');
      setDemoData({
        userCount: 15,
        testCount: 42,
        lastActivity: new Date().toISOString(),
        demoSessionId: `demo_${Date.now()}`
      });
    }
  };

  const toggleDemoMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    if (newMode) {
      localStorage.setItem('demo_mode', 'true');
      document.cookie = 'demo_mode=true; path=/; max-age=3600';
    } else {
      localStorage.removeItem('demo_mode');
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    
    if (enabled) {
      localStorage.setItem('demo_mode', 'true');
      document.cookie = 'demo_mode=true; path=/; max-age=3600';
    } else {
      localStorage.removeItem('demo_mode');
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const getDemoIndicator = () => {
    if (!isDemoMode) return null;
    
    return (
      <div className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
        <Database className="h-3 w-3" />
        <span>DEMO</span>
      </div>
    );
  };

  const value: DemoContextType = {
    isDemoMode,
    demoData,
    toggleDemoMode,
    setDemoMode,
    getDemoIndicator
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};
EOF

echo -e "${GREEN}✅ Hook useDemoMode créé${NC}"

# Créer les scripts de gestion
cat > $PROJECT_ROOT/demo-system/scripts/deployment/setup-demo.sh << 'EOF'
#!/bin/bash

echo "🚀 Configuration du Système DEMO"
echo "================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/opt/orientationpro"
DEMO_SYSTEM="$PROJECT_ROOT/demo-system"

echo -e "${BLUE}📋 Configuration du système DEMO...${NC}"

# 1. Configuration de la base de données
echo -e "${YELLOW}🗄️ Configuration de la base de données...${NC}"
cd $DEMO_SYSTEM/backend

# Créer le schéma DEMO
node -e "
const DemoDatabaseService = require('./services/demoDatabaseService');
const service = new DemoDatabaseService();

async function setup() {
  try {
    await service.createDemoSchema();
    await service.cloneProductionStructure();
    await service.generateDemoData();
    console.log('✅ Base de données DEMO configurée');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setup();
"

# 2. Configuration du backend
echo -e "${YELLOW}🔧 Configuration du backend...${NC}"
cd $PROJECT_ROOT

# Ajouter le middleware DEMO au backend existant
if [ -f "backend/src/app.js" ]; then
  echo "const demoMiddleware = require('./demo-system/backend/middleware/demoMiddleware');" >> backend/src/app.js
  echo "app.use(demoMiddleware.apply);" >> backend/src/app.js
  echo "app.use(demoMiddleware.handleWrites);" >> backend/src/app.js
  echo "app.use(demoMiddleware.auditActivity);" >> backend/src/app.js
fi

# 3. Configuration du frontend
echo -e "${YELLOW}🎨 Configuration du frontend...${NC}"

# Ajouter le provider DEMO au frontend
if [ -f "src/App.tsx" ]; then
  # Backup du fichier original
  cp src/App.tsx src/App.tsx.backup
  
  # Ajouter l'import du DemoProvider
  sed -i '1i import { DemoProvider } from "./demo-system/frontend/hooks/useDemoMode";' src/App.tsx
  
  # Wrapper l'application avec DemoProvider
  sed -i 's/<AuthProvider>/<DemoProvider><AuthProvider>/' src/App.tsx
  sed -i 's/<\/AuthProvider>/<\/AuthProvider><\/DemoProvider>/' src/App.tsx
fi

# 4. Configuration des variables d'environnement
echo -e "${YELLOW}⚙️ Configuration des variables d'environnement...${NC}"

# Créer le fichier .env.demo
cat > $PROJECT_ROOT/.env.demo << 'ENV_EOF'
# Configuration DEMO
DEMO_MODE=true
DEMO_SCHEMA=demo
DEMO_PREFIX=demo_
DEMO_AUDIT=true
DEMO_ISOLATION=true

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orientationpro
DB_USER=postgres
DB_PASSWORD=password

# Backend
BACKEND_DEMO_MIDDLEWARE=true
BACKEND_MOCK_WRITES=true
BACKEND_LOGGING=true
BACKEND_AUDIT_TRAIL=true

# Frontend
FRONTEND_DEMO_OVERLAY=true
FRONTEND_VISUAL_INDICATORS=true
FRONTEND_ADAPTIVE_BEHAVIOR=true
FRONTEND_DEMO_BADGE=true

# Sécurité
SECURITY_STRICT_ISOLATION=true
SECURITY_NO_PROD_WRITES=true
SECURITY_AUDIT_ACTIVITIES=true
SECURITY_RLS_ENABLED=true

# Monitoring
MONITORING_DEMO_METRICS=true
MONITORING_PERFORMANCE_TRACKING=true
MONITORING_ACTIVITY_LOGGING=true
ENV_EOF

echo -e "${GREEN}✅ Variables d'environnement DEMO configurées${NC}"

# 5. Créer les scripts de gestion
echo -e "${YELLOW}📜 Création des scripts de gestion...${NC}"

# Script d'activation du mode DEMO
cat > $DEMO_SYSTEM/scripts/activate-demo.sh << 'SCRIPT_EOF'
#!/bin/bash
echo "🔵 Activation du mode DEMO..."
export DEMO_MODE=true
export NODE_ENV=demo
echo "✅ Mode DEMO activé"
echo "💡 Redémarrez l'application pour appliquer les changements"
SCRIPT_EOF

# Script de désactivation du mode DEMO
cat > $DEMO_SYSTEM/scripts/deactivate-demo.sh << 'SCRIPT_EOF'
#!/bin/bash
echo "🔴 Désactivation du mode DEMO..."
unset DEMO_MODE
export NODE_ENV=production
echo "✅ Mode DEMO désactivé"
echo "💡 Redémarrez l'application pour appliquer les changements"
SCRIPT_EOF

# Script de reset du schéma DEMO
cat > $DEMO_SYSTEM/scripts/reset-demo.sh << 'SCRIPT_EOF'
#!/bin/bash
echo "🔄 Reset du schéma DEMO..."
cd /opt/orientationpro/demo-system/backend
node -e "
const DemoDatabaseService = require('./services/demoDatabaseService');
const service = new DemoDatabaseService();

async function reset() {
  try {
    await service.resetDemoSchema();
    await service.createDemoSchema();
    await service.cloneProductionStructure();
    await service.generateDemoData();
    console.log('✅ Schéma DEMO reset avec succès');
  } catch (error) {
    console.error('❌ Erreur reset:', error.message);
  }
}

reset();
"
SCRIPT_EOF

# Rendre les scripts exécutables
chmod +x $DEMO_SYSTEM/scripts/activate-demo.sh
chmod +x $DEMO_SYSTEM/scripts/deactivate-demo.sh
chmod +x $DEMO_SYSTEM/scripts/reset-demo.sh

echo -e "${GREEN}✅ Scripts de gestion créés${NC}"

# 6. Créer la documentation
echo -e "${YELLOW}📚 Création de la documentation...${NC}"

cat > $DEMO_SYSTEM/docs/README.md << 'DOC_EOF'
# Système DEMO Intégré

## Vue d'ensemble

Le système DEMO permet de créer un environnement de démonstration isolé qui clone la production sans affecter les données réelles.

## Architecture

### Base de données
- **Schéma DEMO**: `demo` - Isolé de la production
- **Synchronisation**: Structure clonée automatiquement
- **Données**: Générées automatiquement avec des données réalistes

### Backend
- **Middleware**: Détection automatique du mode DEMO
- **Mock des écritures**: Simulation des opérations de modification
- **Audit**: Journalisation complète des activités DEMO

### Frontend
- **Overlay**: Indicateurs visuels du mode DEMO
- **Badges**: Marquage des éléments en mode DEMO
- **Comportement adaptatif**: Interface adaptée au mode DEMO

## Utilisation

### Activation du mode DEMO
```bash
# Via script
./demo-system/scripts/activate-demo.sh

# Via variables d'environnement
export DEMO_MODE=true
npm run dev
```

### Désactivation du mode DEMO
```bash
# Via script
./demo-system/scripts/deactivate-demo.sh

# Via variables d'environnement
unset DEMO_MODE
npm run dev
```

### Reset du schéma DEMO
```bash
./demo-system/scripts/reset-demo.sh
```

## Sécurité

- **Isolation stricte**: Aucune écriture en production
- **RLS activé**: Row Level Security sur le schéma DEMO
- **Audit complet**: Toutes les activités sont journalisées

## Monitoring

- **Métriques DEMO**: Suivi des performances
- **Activité**: Logs détaillés des actions
- **Dashboard**: Interface d'administration dédiée

## Développement

### Ajout de nouvelles fonctionnalités DEMO

1. **Backend**: Ajouter la logique dans `demo-system/backend/`
2. **Frontend**: Créer les composants dans `demo-system/frontend/`
3. **Base de données**: Mettre à jour les migrations dans `demo-system/database/`

### Tests

```bash
# Test du mode DEMO
npm run test:demo

# Test de l'isolation
npm run test:isolation
```
DOC_EOF

echo -e "${GREEN}✅ Documentation créée${NC}"

echo ""
echo -e "${GREEN}🎉 Configuration du système DEMO terminée !${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "1. Redémarrer l'application"
echo "2. Tester le mode DEMO"
echo "3. Vérifier l'isolation"
echo "4. Configurer le monitoring"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Guide complet: $DEMO_SYSTEM/docs/README.md"
echo "• Scripts: $DEMO_SYSTEM/scripts/"
echo "• Configuration: $DEMO_SYSTEM/config.js"
EOF 