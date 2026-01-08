#!/bin/bash

echo "🌐 Import des Workflows N8N via Interface Web"

# Configuration
N8N_URL="http://localhost:5678"
WORKFLOWS_DIR="/opt/orientationpro/workflows"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔍 Vérification de N8N...${NC}"
if curl -s "$N8N_URL" > /dev/null; then
    echo -e "${GREEN}✅ N8N est accessible sur $N8N_URL${NC}"
else
    echo -e "${YELLOW}⚠️ N8N n'est pas encore accessible, attendez quelques minutes...${NC}"
    echo "⏳ Attente du démarrage de N8N..."
    sleep 30
    if curl -s "$N8N_URL" > /dev/null; then
        echo -e "${GREEN}✅ N8N est maintenant accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ N8N n'est toujours pas accessible, mais vous pouvez continuer${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📋 Instructions pour importer les workflows via l'interface web:${NC}"
echo "================================================================"
echo ""
echo "1. 🌐 Ouvrez votre navigateur et allez sur:"
echo "   $N8N_URL"
echo ""
echo "2. 🔐 Connectez-vous avec:"
echo "   Utilisateur: admin"
echo "   Mot de passe: orientationpro2024"
echo ""
echo "3. 📁 Importez les workflows:"
echo "   - Cliquez sur 'Workflows' dans le menu"
echo "   - Cliquez sur 'Import from file' (ou l'icône d'import)"
echo "   - Sélectionnez les fichiers depuis $WORKFLOWS_DIR/"
echo ""
echo "4. ✅ Activez chaque workflow:"
echo "   - Ouvrez chaque workflow importé"
echo "   - Cliquez sur le toggle 'Active' (en haut à droite)"
echo "   - Le toggle devient vert quand le workflow est actif"
echo "   - Sauvegardez les changements"
echo ""

echo -e "${BLUE}📁 Fichiers de workflows à importer:${NC}"
ls -la "$WORKFLOWS_DIR"/*.json | while read -r line; do
    filename=$(basename "$line")
    echo "   • $filename"
done

echo ""
echo -e "${YELLOW}🧪 Après activation, testez avec:${NC}"
echo "   chmod +x test-n8n-final.sh && ./test-n8n-final.sh"
echo ""
echo -e "${BLUE}📚 Documentation complète:${NC}"
echo "   /opt/orientationpro/docs/N8N_INTEGRATION.md"
echo ""
echo -e "${GREEN}🎯 Workflows disponibles:${NC}"
echo "   • Test Completion - Traitement automatique des résultats de tests"
echo "   • User Registration - Automatisation de l'inscription des utilisateurs"
echo "   • CV Analysis - Analyse automatique des CV"
echo "   • Email Notifications - Gestion des emails"
echo "   • Appointment Reminder - Rappels automatiques de rendez-vous"
echo ""
echo -e "${YELLOW}🚀 Une fois les workflows activés, N8N automatiserá:${NC}"
echo "   • Traitement des tests d'orientation"
echo "   • Inscription automatique des utilisateurs"
echo "   • Analyse automatique des CV"
echo "   • Envoi d'emails automatiques"
echo "   • Rappels de rendez-vous automatiques"
echo ""
echo -e "${GREEN}🎉 N8N transformera Orientation Pro Congo en une plateforme intelligente !${NC}" 