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
