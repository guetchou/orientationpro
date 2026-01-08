#!/bin/bash

echo "🌐 Import des Workflows N8N via Interface Web"

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
echo -e "${YELLOW}📋 Instructions détaillées pour importer les workflows:${NC}"
echo "=================================================================="
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
echo -e "${BLUE}4. ✅ Activez chaque workflow:${NC}"
echo "   - Ouvrez chaque workflow importé"
echo "   - Cliquez sur le toggle 'Active' (en haut à droite)"
echo "   - Le toggle devient vert quand le workflow est actif"
echo "   - Sauvegardez les changements (Ctrl+S)"
echo ""

echo -e "${YELLOW}📁 Fichiers de workflows à importer:${NC}"
ls -la "$WORKFLOWS_DIR"/*.json | while read -r line; do
    filename=$(basename "$line")
    echo "   • $filename"
done

echo ""
echo -e "${GREEN}🎯 Workflows disponibles:${NC}"
echo "   • test-completion-workflow.json - Traitement automatique des résultats de tests"
echo "   • user-registration-workflow.json - Automatisation de l'inscription des utilisateurs"
echo "   • cv-analysis-workflow.json - Analyse automatique des CV"
echo "   • email-notifications-workflow.json - Gestion des emails"
echo "   • appointment-reminder-workflow.json - Rappels automatiques de rendez-vous"
echo ""

echo -e "${YELLOW}🚀 Une fois les workflows activés, N8N automatiserá:${NC}"
echo "   • Traitement des tests d'orientation"
echo "   • Inscription automatique des utilisateurs"
echo "   • Analyse automatique des CV"
echo "   • Envoi d'emails automatiques"
echo "   • Rappels de rendez-vous automatiques"
echo ""

echo -e "${BLUE}🧪 Après activation, testez avec:${NC}"
echo "   chmod +x test-n8n-final.sh && ./test-n8n-final.sh"
echo ""
echo -e "${BLUE}📚 Documentation complète:${NC}"
echo "   /opt/orientationpro/docs/N8N_INTEGRATION.md"
echo ""
echo -e "${GREEN}🎉 N8N transformera Orientation Pro Congo en une plateforme intelligente !${NC}"
echo ""
echo -e "${YELLOW}💡 Conseil: Importez un workflow à la fois pour éviter les conflits${NC}" 