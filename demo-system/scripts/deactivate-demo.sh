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
