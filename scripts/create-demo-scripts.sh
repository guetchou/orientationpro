#!/bin/bash

echo "📜 Création des Scripts de Gestion DEMO"
echo "======================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEMO_SYSTEM="/opt/orientationpro/demo-system"

# Script d'activation du mode DEMO
cat > $DEMO_SYSTEM/scripts/activate-demo.sh << 'EOF'
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
EOF

# Script de désactivation du mode DEMO
cat > $DEMO_SYSTEM/scripts/deactivate-demo.sh << 'EOF'
#!/bin/bash

echo "🔴 Désactivation du mode DEMO..."
echo "================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/opt/orientationpro"

echo -e "${BLUE}📋 Désactivation du mode DEMO...${NC}"

# 1. Désactiver les variables d'environnement
unset DEMO_MODE
export NODE_ENV=production
unset DEMO_SCHEMA
unset DEMO_PREFIX

# 2. Supprimer le fichier .env.demo
if [ -f "$PROJECT_ROOT/.env.demo" ]; then
    rm $PROJECT_ROOT/.env.demo
    echo -e "${GREEN}✅ Fichier .env.demo supprimé${NC}"
fi

# 3. Restaurer le frontend si nécessaire
if [ -f "src/App.tsx.backup" ]; then
    cp src/App.tsx.backup src/App.tsx
    echo -e "${GREEN}✅ Frontend restauré${NC}"
fi

# 4. Restaurer le backend si nécessaire
if [ -f "backend/src/app.js.backup" ]; then
    cp backend/src/app.js.backup backend/src/app.js
    echo -e "${GREEN}✅ Backend restauré${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Mode DEMO désactivé !${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "1. Redémarrer l'application: npm run dev"
echo "2. Vérifier le retour en mode production"
echo "3. Tester les fonctionnalités"
echo ""
echo -e "${BLUE}💡 Pour réactiver: ./demo-system/scripts/activate-demo.sh${NC}"
EOF

# Script de reset du schéma DEMO
cat > $DEMO_SYSTEM/scripts/reset-demo.sh << 'EOF'
#!/bin/bash

echo "🔄 Reset du schéma DEMO..."
echo "=========================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEMO_SYSTEM="/opt/orientationpro/demo-system"

echo -e "${BLUE}📋 Reset du schéma DEMO...${NC}"

# 1. Confirmation
read -p "⚠️  Êtes-vous sûr de vouloir reset le schéma DEMO ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Reset annulé${NC}"
    exit 1
fi

# 2. Reset du schéma
cd $DEMO_SYSTEM/backend

node -e "
const DemoDatabaseService = require('./services/demoDatabaseService');

async function resetDemo() {
  try {
    const service = new DemoDatabaseService();
    console.log('🔄 Suppression du schéma DEMO...');
    await service.resetDemoSchema();
    
    console.log('🔄 Création du nouveau schéma DEMO...');
    await service.createDemoSchema();
    
    console.log('🔄 Clonage de la structure de production...');
    await service.cloneProductionStructure();
    
    console.log('🔄 Génération des données de démonstration...');
    await service.generateDemoData();
    
    console.log('✅ Schéma DEMO reset avec succès');
  } catch (error) {
    console.error('❌ Erreur reset:', error.message);
    process.exit(1);
  }
}

resetDemo();
"

echo ""
echo -e "${GREEN}🎉 Reset du schéma DEMO terminé !${NC}"
echo ""
echo -e "${YELLOW}📋 Données de démonstration:${NC}"
echo "• Utilisateurs: demo.user@example.com, demo.admin@example.com, demo.conseiller@example.com"
echo "• Tests: 5 tests par type générés"
echo "• Blog: 2 articles de démonstration"
echo ""
echo -e "${BLUE}💡 Redémarrez l'application pour voir les changements${NC}"
EOF

# Script de sauvegarde du schéma DEMO
cat > $DEMO_SYSTEM/scripts/backup-demo.sh << 'EOF'
#!/bin/bash

echo "💾 Sauvegarde du schéma DEMO..."
echo "==============================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEMO_SYSTEM="/opt/orientationpro/demo-system"
BACKUP_DIR="$DEMO_SYSTEM/database/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="demo_backup_$TIMESTAMP.sql"

echo -e "${BLUE}📋 Sauvegarde du schéma DEMO...${NC}"

# 1. Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# 2. Sauvegarder le schéma DEMO
cd $DEMO_SYSTEM/backend

node -e "
const DemoDatabaseService = require('./services/demoDatabaseService');

async function backupDemo() {
  try {
    const service = new DemoDatabaseService();
    await service.backupDemoSchema();
    console.log('✅ Sauvegarde DEMO créée');
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error.message);
    process.exit(1);
  }
}

backupDemo();
"

echo ""
echo -e "${GREEN}🎉 Sauvegarde DEMO terminée !${NC}"
echo ""
echo -e "${YELLOW}📋 Fichier de sauvegarde:${NC}"
echo "• $BACKUP_DIR/$BACKUP_FILE"
echo ""
echo -e "${BLUE}💡 Pour restaurer: ./demo-system/scripts/restore-demo.sh $BACKUP_FILE${NC}"
EOF

# Script de restauration du schéma DEMO
cat > $DEMO_SYSTEM/scripts/restore-demo.sh << 'EOF'
#!/bin/bash

echo "📥 Restauration du schéma DEMO..."
echo "================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEMO_SYSTEM="/opt/orientationpro/demo-system"
BACKUP_DIR="$DEMO_SYSTEM/database/backups"

# Vérifier l'argument
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <fichier_sauvegarde>${NC}"
    echo -e "${YELLOW}📋 Sauvegardes disponibles:${NC}"
    ls -la $BACKUP_DIR/*.sql 2>/dev/null || echo "Aucune sauvegarde trouvée"
    exit 1
fi

BACKUP_FILE="$1"
FULL_PATH="$BACKUP_DIR/$BACKUP_FILE"

if [ ! -f "$FULL_PATH" ]; then
    echo -e "${RED}❌ Fichier de sauvegarde non trouvé: $FULL_PATH${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Restauration depuis: $BACKUP_FILE${NC}"

# 1. Confirmation
read -p "⚠️  Êtes-vous sûr de vouloir restaurer le schéma DEMO ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Restauration annulée${NC}"
    exit 1
fi

# 2. Restaurer le schéma
echo -e "${YELLOW}🔄 Restauration en cours...${NC}"

# Supprimer le schéma existant
psql -h localhost -U postgres -d orientationpro -c "DROP SCHEMA IF EXISTS demo CASCADE;"

# Restaurer depuis la sauvegarde
psql -h localhost -U postgres -d orientationpro -f "$FULL_PATH"

echo ""
echo -e "${GREEN}🎉 Restauration DEMO terminée !${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "1. Redémarrer l'application"
echo "2. Vérifier les données restaurées"
echo "3. Tester les fonctionnalités"
EOF

# Rendre tous les scripts exécutables
chmod +x $DEMO_SYSTEM/scripts/*.sh

echo -e "${GREEN}✅ Scripts de gestion créés${NC}"
echo ""
echo -e "${YELLOW}📋 Scripts disponibles:${NC}"
echo "• activate-demo.sh - Activer le mode DEMO"
echo "• deactivate-demo.sh - Désactiver le mode DEMO"
echo "• reset-demo.sh - Reset du schéma DEMO"
echo "• backup-demo.sh - Sauvegarder le schéma DEMO"
echo "• restore-demo.sh - Restaurer le schéma DEMO"
echo ""
echo -e "${BLUE}💡 Utilisation: ./demo-system/scripts/[nom_du_script].sh${NC}" 