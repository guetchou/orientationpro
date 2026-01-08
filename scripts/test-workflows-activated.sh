#!/bin/bash

echo "🧪 Test des workflows N8N après activation"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Vérification des workflows actifs...${NC}"

# Vérifier les workflows actifs
active_workflows=$(curl -s http://localhost:5678/api/v1/workflows | jq '.data[] | select(.active == true) | .name' 2>/dev/null)

if [ -n "$active_workflows" ]; then
    echo -e "${GREEN}✅ Workflows actifs trouvés:${NC}"
    echo "$active_workflows" | while read -r workflow; do
        echo "  • $workflow"
    done
    
    echo ""
    echo -e "${BLUE}🧪 Test des webhooks...${NC}"
    
    # Test 1: Test Completion
    echo "📋 Test du webhook Test Completion..."
    response=$(curl -s -w "%{http_code}" -X POST "http://localhost:5678/webhook/test-completion" \
        -H "Content-Type: application/json" \
        -d '{"testType": "riasec", "userId": "test-123", "results": {"realistic": 75}}')
    
    http_code="${response: -3}"
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ Test Completion: Fonctionne${NC}"
    else
        echo -e "${RED}❌ Test Completion: Erreur HTTP $http_code${NC}"
    fi
    
    # Test 2: User Registration
    echo "📋 Test du webhook User Registration..."
    response=$(curl -s -w "%{http_code}" -X POST "http://localhost:5678/webhook/user-registration" \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com", "firstName": "Test", "lastName": "User"}')
    
    http_code="${response: -3}"
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ User Registration: Fonctionne${NC}"
    else
        echo -e "${RED}❌ User Registration: Erreur HTTP $http_code${NC}"
    fi
    
else
    echo -e "${RED}❌ Aucun workflow actif trouvé${NC}"
    echo ""
    echo -e "${BLUE}📋 Instructions pour activer les workflows:${NC}"
    echo "1. Accédez à http://localhost:5678"
    echo "2. Connectez-vous avec admin/orientationpro2024"
    echo "3. Allez dans l'onglet 'Workflows'"
    echo "4. Importez les fichiers depuis /opt/orientationpro/workflows/"
    echo "5. Activez chaque workflow en cliquant sur le toggle 'Active'"
    echo ""
    echo -e "${BLUE}📁 Fichiers de workflows disponibles:${NC}"
    ls -la /opt/orientationpro/workflows/*.json
fi

echo ""
echo -e "${BLUE}📚 Documentation disponible:${NC}"
echo "• Guide complet: /opt/orientationpro/docs/N8N_INTEGRATION.md"
echo "• Résumé: N8N_INTEGRATION_SUMMARY.md"
echo "• Tests: test-n8n-workflows.sh" 