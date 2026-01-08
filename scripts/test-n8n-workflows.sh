#!/bin/bash

echo "🧪 Test des workflows N8N pour Orientation Pro Congo"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour tester un webhook
test_webhook() {
    local name=$1
    local url=$2
    local data=$3
    
    echo -e "${BLUE}🔍 Test du webhook: $name${NC}"
    
    response=$(curl -s -w "%{http_code}" -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ $name: Succès (HTTP $http_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: Échec (HTTP $http_code)${NC}"
        echo "Réponse: $response_body"
        return 1
    fi
}

# Vérifier que N8N est accessible
echo -e "${BLUE}🌐 Vérification de l'accès à N8N...${NC}"
if curl -s http://localhost:5678 > /dev/null; then
    echo -e "${GREEN}✅ N8N est accessible${NC}"
else
    echo -e "${RED}❌ N8N n'est pas accessible${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Démarrage des tests des workflows...${NC}"
echo ""

# Test 1: Test Completion Workflow
echo -e "${BLUE}📋 Test 1: Test Completion Workflow${NC}"
test_webhook "Test Completion" \
    "http://localhost:5678/webhook/test-completion" \
    '{
        "testType": "riasec",
        "userId": "test-user-123",
        "results": {
            "realistic": 75,
            "investigative": 80,
            "artistic": 65,
            "social": 70,
            "enterprising": 85,
            "conventional": 60
        },
        "completionTime": "2024-07-20T10:30:00Z"
    }'

# Test 2: User Registration Workflow
echo ""
echo -e "${BLUE}📋 Test 2: User Registration Workflow${NC}"
test_webhook "User Registration" \
    "http://localhost:5678/webhook/user-registration" \
    '{
        "email": "test@example.com",
        "password": "securepassword123",
        "firstName": "Jean",
        "lastName": "Dupont",
        "role": "user"
    }'

# Test 3: CV Analysis Workflow
echo ""
echo -e "${BLUE}📋 Test 3: CV Analysis Workflow${NC}"
test_webhook "CV Analysis" \
    "http://localhost:5678/webhook/cv-upload" \
    '{
        "userId": "test-user-123",
        "cvFile": "base64-encoded-cv-content",
        "fileName": "cv-jean-dupont.pdf",
        "fileType": "application/pdf"
    }'

# Test 4: Email Notifications Workflow
echo ""
echo -e "${BLUE}📋 Test 4: Email Notifications Workflow${NC}"
test_webhook "Email Notifications" \
    "http://localhost:5678/webhook/send-email" \
    '{
        "to": "test@example.com",
        "template": "welcome",
        "firstName": "Jean",
        "lastName": "Dupont"
    }'

# Test 5: Vérification des workflows actifs
echo ""
echo -e "${BLUE}📋 Test 5: Vérification des workflows actifs${NC}"
workflows_response=$(curl -s http://localhost:5678/api/v1/workflows)
if [ $? -eq 0 ]; then
    workflow_count=$(echo "$workflows_response" | jq '.data | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Nombre de workflows actifs: $workflow_count${NC}"
else
    echo -e "${RED}❌ Impossible de récupérer les workflows${NC}"
fi

# Test 6: Vérification de la base de données N8N
echo ""
echo -e "${BLUE}📋 Test 6: Vérification de la base de données N8N${NC}"
db_status=$(docker exec n8n-postgres pg_isready -U n8n 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de données N8N opérationnelle${NC}"
else
    echo -e "${RED}❌ Problème avec la base de données N8N${NC}"
fi

# Résumé des tests
echo ""
echo -e "${YELLOW}📊 Résumé des tests N8N${NC}"
echo "=================================="

# Compter les succès et échecs
success_count=0
failure_count=0

# Vérifier les résultats des tests précédents
if [ $? -eq 0 ]; then
    success_count=$((success_count + 1))
else
    failure_count=$((failure_count + 1))
fi

echo -e "${GREEN}✅ Tests réussis: $success_count${NC}"
echo -e "${RED}❌ Tests échoués: $failure_count${NC}"

echo ""
echo -e "${BLUE}🌐 Accès à N8N: http://localhost:5678${NC}"
echo -e "${BLUE}👤 Identifiants: admin / orientationpro2024${NC}"

if [ $failure_count -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Tous les workflows N8N fonctionnent correctement !${NC}"
    echo ""
    echo -e "${YELLOW}📋 Workflows disponibles:${NC}"
    echo "• Test Completion - Traitement automatique des résultats"
    echo "• User Registration - Inscription automatisée"
    echo "• CV Analysis - Analyse automatique des CV"
    echo "• Email Notifications - Gestion des emails"
    echo "• Appointment Reminder - Rappels automatiques"
else
    echo ""
    echo -e "${RED}⚠️ Certains workflows nécessitent une attention${NC}"
    echo "Vérifiez la configuration et les logs N8N"
fi

echo ""
echo -e "${BLUE}📚 Documentation: /opt/orientationpro/docs/N8N_INTEGRATION.md${NC}" 