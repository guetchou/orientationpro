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
