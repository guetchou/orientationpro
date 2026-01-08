#!/bin/bash

echo "🌐 Import des Workflows N8N via Interface Web - Instructions Détaillées"

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
echo -e "${YELLOW}📋 GUIDE DÉTAILLÉ POUR L'IMPORT DES WORKFLOWS${NC}"
echo "======================================================"
echo ""
echo -e "${BLUE}ÉTAPE 1: Accès à N8N${NC}"
echo "1. Ouvrez votre navigateur web"
echo "2. Allez sur: $N8N_URL"
echo "3. Connectez-vous avec:"
echo "   - Utilisateur: admin"
echo "   - Mot de passe: orientationpro2024"
echo ""
echo -e "${BLUE}ÉTAPE 2: Import des Workflows${NC}"
echo "1. Dans le menu de gauche, cliquez sur 'Workflows'"
echo "2. Cliquez sur le bouton 'Import from file' (icône d'import)"
echo "3. Sélectionnez les fichiers depuis: $WORKFLOWS_DIR/"
echo "4. Importez un workflow à la fois pour éviter les conflits"
echo ""
echo -e "${BLUE}ÉTAPE 3: Activation des Workflows${NC}"
echo "1. Ouvrez chaque workflow importé"
echo "2. Cliquez sur le toggle 'Active' (en haut à droite)"
echo "3. Le toggle devient vert quand le workflow est actif"
echo "4. Sauvegardez les changements (Ctrl+S)"
echo "5. Répétez pour chaque workflow"
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

echo -e "${YELLOW}🚀 Une fois activés, N8N automatiserá:${NC}"
echo "   • Traitement des tests d'orientation"
echo "   • Inscription automatique des utilisateurs"
echo "   • Analyse automatique des CV"
echo "   • Envoi d'emails automatiques"
echo "   • Rappels de rendez-vous automatiques"
echo ""

echo -e "${BLUE}🧪 Après import et activation, testez avec:${NC}"
echo "   chmod +x test-workflows-after-import.sh && ./test-workflows-after-import.sh"
echo ""
echo -e "${BLUE}📚 Documentation complète:${NC}"
echo "   /opt/orientationpro/docs/N8N_INTEGRATION.md"
echo ""
echo -e "${GREEN}🎉 N8N transformera Orientation Pro Congo en une plateforme intelligente !${NC}"
echo ""
echo -e "${YELLOW}💡 Conseils:${NC}"
echo "   • Importez un workflow à la fois"
echo "   • Vérifiez que chaque workflow est activé avant de passer au suivant"
echo "   • Sauvegardez après chaque activation"
echo "   • Testez les webhooks après activation"
echo ""
echo -e "${BLUE}📞 Support:${NC}"
echo "   Si vous rencontrez des problèmes:"
echo "   • Vérifiez que N8N est accessible"
echo "   • Vérifiez les identifiants de connexion"
echo "   • Redémarrez N8N si nécessaire"
echo "   • Consultez la documentation" 