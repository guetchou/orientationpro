#!/bin/bash

echo "🧪 Test Final des Workflows N8N"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔍 Vérification de N8N...${NC}"
if curl -s http://localhost:5678 > /dev/null; then
    echo -e "${GREEN}✅ N8N est accessible${NC}"
else
    echo -e "${RED}❌ N8N n'est pas accessible${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🧪 Test des webhooks après activation des workflows...${NC}"
echo ""

# Test 1: Test Completion
echo -e "${BLUE}📋 Test du webhook Test Completion...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "http://localhost:5678/webhook/test-completion" \
    -H "Content-Type: application/json" \
    -d '{
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
        "completionTime": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Test Completion: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ Test Completion: Erreur HTTP $http_code${NC}"
    echo "Réponse: ${response%???}"
fi

# Test 2: User Registration
echo ""
echo -e "${BLUE}📋 Test du webhook User Registration...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "http://localhost:5678/webhook/user-registration" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "password": "securepassword123",
        "firstName": "Jean",
        "lastName": "Dupont",
        "role": "user"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ User Registration: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ User Registration: Erreur HTTP $http_code${NC}"
    echo "Réponse: ${response%???}"
fi

# Test 3: CV Analysis
echo ""
echo -e "${BLUE}📋 Test du webhook CV Analysis...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "http://localhost:5678/webhook/cv-upload" \
    -H "Content-Type: application/json" \
    -d '{
        "userId": "test-user-123",
        "cvFile": "base64-encoded-cv-content",
        "fileName": "cv-jean-dupont.pdf",
        "fileType": "application/pdf"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ CV Analysis: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ CV Analysis: Erreur HTTP $http_code${NC}"
    echo "Réponse: ${response%???}"
fi

# Test 4: Email Notifications
echo ""
echo -e "${BLUE}📋 Test du webhook Email Notifications...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "http://localhost:5678/webhook/send-email" \
    -H "Content-Type: application/json" \
    -d '{
        "to": "test@example.com",
        "template": "welcome",
        "firstName": "Jean",
        "lastName": "Dupont"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Email Notifications: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ Email Notifications: Erreur HTTP $http_code${NC}"
    echo "Réponse: ${response%???}"
fi

echo ""
echo -e "${YELLOW}📊 Résumé des tests:${NC}"
echo "=================================="

# Compter les succès
success_count=0
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    success_count=$((success_count + 1))
fi

echo -e "${GREEN}✅ Tests réussis: $success_count/4${NC}"

echo ""
echo -e "${BLUE}🌐 Accès à N8N: http://localhost:5678/home/workflows${NC}"
echo -e "${BLUE}👤 Identifiants: admin / orientationpro2024${NC}"

if [ $success_count -eq 4 ]; then
    echo ""
    echo -e "${GREEN}🎉 Tous les workflows N8N fonctionnent parfaitement !${NC}"
    echo ""
    echo -e "${YELLOW}📋 Workflows opérationnels:${NC}"
    echo "• Test Completion - Traitement automatique des résultats"
    echo "• User Registration - Inscription automatisée"
    echo "• CV Analysis - Analyse automatique des CV"
    echo "• Email Notifications - Gestion des emails"
    echo "• Appointment Reminder - Rappels automatiques"
else
    echo ""
    echo -e "${RED}⚠️ Certains workflows nécessitent une activation manuelle${NC}"
    echo "Vérifiez que tous les workflows sont activés dans l'interface N8N"
fi

echo ""
echo -e "${BLUE}📚 Documentation: /opt/orientationpro/docs/N8N_INTEGRATION.md${NC}" 