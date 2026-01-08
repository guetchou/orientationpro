#!/bin/bash

echo "🚀 Import et Activation des Workflows N8N - Orientation Pro Congo"

# Configuration
N8N_URL="http://localhost:5678"
WORKFLOWS_DIR="/opt/orientationpro/workflows"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Vérification de N8N...${NC}"
if curl -s "$N8N_URL" > /dev/null; then
    echo -e "${GREEN}✅ N8N est accessible sur $N8N_URL${NC}"
else
    echo -e "${RED}❌ N8N n'est pas accessible${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 ÉTAPE 1: Import des Workflows${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}1. 🌐 Ouvrez votre navigateur et allez sur:${NC}"
echo "   $N8N_URL"
echo ""
echo -e "${BLUE}2. 🔐 Connectez-vous avec:${NC}"
echo "   Utilisateur: admin"
echo "   Mot de passe: orientationpro2024"
echo ""
echo -e "${BLUE}3. 📁 Importez les workflows:${NC}"
echo "   - Cliquez sur 'Workflows' dans le menu de gauche"
echo "   - Cliquez sur 'Import from file' (icône d'import en haut)"
echo "   - Sélectionnez les fichiers depuis $WORKFLOWS_DIR/"
echo ""

echo -e "${YELLOW}📁 Fichiers à importer:${NC}"
for file in "$WORKFLOWS_DIR"/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "   • $filename"
    fi
done

echo ""
echo -e "${YELLOW}📋 ÉTAPE 2: Activation des Workflows${NC}"
echo "============================================="
echo ""
echo -e "${BLUE}4. ✅ Activez chaque workflow:${NC}"
echo "   - Ouvrez chaque workflow importé"
echo "   - Cliquez sur le toggle 'Active' (en haut à droite)"
echo "   - Le toggle devient vert quand le workflow est actif"
echo "   - Sauvegardez les changements (Ctrl+S)"
echo ""

echo -e "${YELLOW}📋 ÉTAPE 3: Vérification${NC}"
echo "============================="
echo ""
echo -e "${BLUE}5. 🧪 Testez les workflows:${NC}"
echo "   chmod +x test-workflows-after-import.sh && ./test-workflows-after-import.sh"
echo ""

echo -e "${GREEN}🎯 Workflows à activer:${NC}"
echo "   • Test Completion - Traitement automatique des résultats de tests"
echo "   • User Registration - Automatisation de l'inscription des utilisateurs"
echo "   • CV Analysis - Analyse automatique des CV"
echo "   • Email Notifications - Gestion des emails"
echo "   • Appointment Reminder - Rappels automatiques de rendez-vous"
echo ""

echo -e "${YELLOW}🚀 Une fois activés, N8N automatiserá:${NC}"
echo "   • Traitement des tests d'orientation"
echo "   • Inscription automatique des utilisateurs"
echo "   • Analyse automatique des CV"
echo "   • Envoi d'emails automatiques"
echo "   • Rappels de rendez-vous automatiques"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "   /opt/orientationpro/docs/N8N_INTEGRATION.md"
echo ""
echo -e "${GREEN}🎉 Prêt à transformer Orientation Pro Congo en plateforme intelligente !${NC}"
echo ""
echo -e "${YELLOW}💡 Conseil: Importez un workflow à la fois pour éviter les conflits${NC}" 