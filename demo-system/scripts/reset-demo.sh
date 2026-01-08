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
