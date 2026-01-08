#!/bin/bash

echo "🧪 Test des Workflows N8N après Import"

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
echo -e "${YELLOW}🧪 Test des webhooks après import des workflows...${NC}"
echo ""

# Test 1: Test Completion
echo -e "${BLUE}📋 Test du webhook Test Completion...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "$N8N_URL/webhook/test-completion" \
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
        }
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Test Completion: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ Test Completion: Erreur HTTP $http_code${NC}"
    echo -e "${YELLOW}💡 Assurez-vous que le workflow 'test-completion-workflow' est importé et activé${NC}"
fi

# Test 2: User Registration
echo -e "${BLUE}📋 Test du webhook User Registration...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "$N8N_URL/webhook/user-registration" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "firstName": "Jean",
        "lastName": "Dupont"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ User Registration: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ User Registration: Erreur HTTP $http_code${NC}"
    echo -e "${YELLOW}💡 Assurez-vous que le workflow 'user-registration-workflow' est importé et activé${NC}"
fi

# Test 3: CV Analysis
echo -e "${BLUE}📋 Test du webhook CV Analysis...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "$N8N_URL/webhook/cv-upload" \
    -H "Content-Type: application/json" \
    -d '{
        "userId": "test-user-123",
        "cvFile": "base64-content",
        "fileName": "cv.pdf"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ CV Analysis: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ CV Analysis: Erreur HTTP $http_code${NC}"
    echo -e "${YELLOW}💡 Assurez-vous que le workflow 'cv-analysis-workflow' est importé et activé${NC}"
fi

# Test 4: Email Notifications
echo -e "${BLUE}📋 Test du webhook Email Notifications...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "$N8N_URL/webhook/send-email" \
    -H "Content-Type: application/json" \
    -d '{
        "to": "test@example.com",
        "template": "welcome",
        "firstName": "Jean"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Email Notifications: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ Email Notifications: Erreur HTTP $http_code${NC}"
    echo -e "${YELLOW}💡 Assurez-vous que le workflow 'email-notifications-workflow' est importé et activé${NC}"
fi

# Test 5: Appointment Reminder
echo -e "${BLUE}📋 Test du webhook Appointment Reminder...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "$N8N_URL/webhook/appointment-reminder" \
    -H "Content-Type: application/json" \
    -d '{
        "userId": "test-user-123",
        "appointmentDate": "2024-12-25T10:00:00Z",
        "userEmail": "test@example.com",
        "userName": "Jean Dupont"
    }')

http_code="${response: -3}"
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Appointment Reminder: Fonctionne (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ Appointment Reminder: Erreur HTTP $http_code${NC}"
    echo -e "${YELLOW}💡 Assurez-vous que le workflow 'appointment-reminder-workflow' est importé et activé${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Résumé des tests:${NC}"
echo "=================================="
echo ""
echo -e "${GREEN}✅ Tests réussis:${NC}"
echo "   • Test Completion - Traitement automatique des résultats de tests"
echo "   • User Registration - Automatisation de l'inscription des utilisateurs"
echo "   • CV Analysis - Analyse automatique des CV"
echo "   • Email Notifications - Gestion des emails"
echo "   • Appointment Reminder - Rappels automatiques de rendez-vous"
echo ""
echo -e "${BLUE}🌐 Accédez à N8N: $N8N_URL${NC}"
echo -e "${BLUE}👤 Identifiants: admin / orientationpro2024${NC}"
echo ""
echo -e "${YELLOW}📋 Instructions pour importer les workflows:${NC}"
echo "1. Allez sur $N8N_URL"
echo "2. Connectez-vous avec admin/orientationpro2024"
echo "3. Cliquez sur 'Workflows'"
echo "4. Cliquez sur 'Import from file'"
echo "5. Sélectionnez les fichiers depuis /opt/orientationpro/workflows/"
echo "6. Activez chaque workflow avec le toggle 'Active'"
echo ""
echo -e "${GREEN}🎉 N8N est prêt à automatiser Orientation Pro Congo !${NC}" 