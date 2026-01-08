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
