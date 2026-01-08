#!/bin/bash

echo "🔵 Activation du mode DEMO..."
echo "=============================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/opt/orientationpro"
DEMO_SYSTEM="$PROJECT_ROOT/demo-system"

echo -e "${BLUE}📋 Configuration du mode DEMO...${NC}"

# 1. Activer les variables d'environnement
export DEMO_MODE=true
export NODE_ENV=demo
export DEMO_SCHEMA=demo
export DEMO_PREFIX=demo_

# 2. Créer le fichier .env.demo s'il n'existe pas
if [ ! -f "$PROJECT_ROOT/.env.demo" ]; then
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
    echo -e "${GREEN}✅ Fichier .env.demo créé${NC}"
fi

# 3. Configurer la base de données DEMO
echo -e "${YELLOW}🗄️ Configuration de la base de données DEMO...${NC}"
cd $DEMO_SYSTEM/backend

# Créer le schéma DEMO et générer les données
node -e "
const DemoDatabaseService = require('./services/demoDatabaseService');

async function setupDemo() {
  try {
    const service = new DemoDatabaseService();
    await service.createDemoSchema();
    await service.cloneProductionStructure();
    await service.generateDemoData();
    console.log('✅ Base de données DEMO configurée');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setupDemo();
"

# 4. Configurer le frontend
echo -e "${YELLOW}🎨 Configuration du frontend...${NC}"
cd $PROJECT_ROOT

# Ajouter le provider DEMO au frontend si pas déjà fait
if [ -f "src/App.tsx" ] && ! grep -q "DemoProvider" src/App.tsx; then
    # Backup du fichier original
    cp src/App.tsx src/App.tsx.backup
    
    # Ajouter l'import du DemoProvider
    sed -i '1i import { DemoProvider } from "./demo-system/frontend/hooks/useDemoMode";' src/App.tsx
    
    # Wrapper l'application avec DemoProvider
    sed -i 's/<AuthProvider>/<DemoProvider><AuthProvider>/' src/App.tsx
    sed -i 's/<\/AuthProvider>/<\/AuthProvider><\/DemoProvider>/' src/App.tsx
    
    echo -e "${GREEN}✅ Frontend configuré pour le mode DEMO${NC}"
fi

# 5. Configurer le backend
echo -e "${YELLOW}🔧 Configuration du backend...${NC}"

# Ajouter le middleware DEMO au backend existant
if [ -f "backend/src/app.js" ] && ! grep -q "demoMiddleware" backend/src/app.js; then
    echo "const demoMiddleware = require('./demo-system/backend/middleware/demoMiddleware');" >> backend/src/app.js
    echo "app.use(demoMiddleware.apply);" >> backend/src/app.js
    echo "app.use(demoMiddleware.handleWrites);" >> backend/src/app.js
    echo "app.use(demoMiddleware.auditActivity);" >> backend/src/app.js
    
    echo -e "${GREEN}✅ Backend configuré pour le mode DEMO${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Mode DEMO activé avec succès !${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "1. Redémarrer l'application: npm run dev"
echo "2. Tester le mode DEMO: http://localhost:8045"
echo "3. Vérifier l'overlay DEMO"
echo "4. Tester les fonctionnalités"
echo ""
echo -e "${BLUE}💡 Pour désactiver: ./demo-system/scripts/deactivate-demo.sh${NC}"
