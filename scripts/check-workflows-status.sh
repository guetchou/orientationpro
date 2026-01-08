#!/bin/bash

echo "🔍 Vérification de l'État des Workflows N8N"

# Configuration
N8N_URL="http://localhost:5678"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔍 Vérification de N8N...${NC}"
if curl -s "$N8N_URL" > /dev/null; then
    echo -e "${GREEN}✅ N8N est accessible sur $N8N_URL${NC}"
else
    echo -e "${RED}❌ N8N n'est pas accessible${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📊 État des Workflows N8N${NC}"
echo "================================"
echo ""

# Vérifier les webhooks disponibles
echo -e "${BLUE}🔍 Vérification des webhooks...${NC}"

# Test des webhooks un par un
webhooks=(
    "test-completion"
    "user-registration"
    "cv-upload"
    "send-email"
    "appointment-reminder"
)

for webhook in "${webhooks[@]}"; do
    echo -n "   • $webhook: "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/webhook/$webhook")
    
    if [ "$response" -eq 404 ]; then
        echo -e "${RED}❌ Non trouvé (404)${NC}"
        echo -e "${YELLOW}      → Workflow non importé ou non activé${NC}"
    elif [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        echo -e "${GREEN}✅ Disponible (HTTP $response)${NC}"
    else
        echo -e "${YELLOW}⚠️ Réponse HTTP $response${NC}"
    fi
done

echo ""
echo -e "${YELLOW}📋 Instructions pour résoudre les problèmes:${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Si les webhooks retournent 404:${NC}"
echo "1. Allez sur $N8N_URL"
echo "2. Connectez-vous avec admin/orientationpro2024"
echo "3. Cliquez sur 'Workflows'"
echo "4. Importez les fichiers depuis /opt/orientationpro/workflows/"
echo "5. Activez chaque workflow avec le toggle 'Active'"
echo "6. Sauvegardez les changements"
echo ""

echo -e "${BLUE}Fichiers de workflows disponibles:${NC}"
ls -la /opt/orientationpro/workflows/*.json | while read -r line; do
    filename=$(basename "$line")
    echo "   • $filename"
done

echo ""
echo -e "${GREEN}🎯 Workflows attendus:${NC}"
echo "   • test-completion-workflow.json"
echo "   • user-registration-workflow.json"
echo "   • cv-analysis-workflow.json"
echo "   • email-notifications-workflow.json"
echo "   • appointment-reminder-workflow.json"
echo ""

echo -e "${YELLOW}🧪 Test complet après import:${NC}"
echo "   ./test-workflows-after-import.sh"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   /opt/orientationpro/docs/N8N_INTEGRATION.md"
echo ""
echo -e "${GREEN}🎉 N8N transformera Orientation Pro Congo !${NC}" 