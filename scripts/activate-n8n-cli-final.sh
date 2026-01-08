#!/bin/bash

echo "🚀 Activation N8N via CLI - Orientation Pro Congo"

# Configuration
N8N_URL="http://localhost:5678"
N8N_USER="admin"
N8N_PASS="orientationpro2024"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction pour attendre que N8N soit prêt
wait_for_n8n() {
    echo -e "${BLUE}⏳ Attente que N8N soit prêt...${NC}"
    for i in {1..20}; do
        if curl -s "$N8N_URL" > /dev/null; then
            echo -e "${GREEN}✅ N8N est accessible sur $N8N_URL${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ Tentative $i/20 - N8N n'est pas encore prêt...${NC}"
            sleep 3
        fi
    done
    echo -e "${RED}❌ N8N n'est pas accessible après 20 tentatives${NC}"
    return 1
}

# Fonction pour créer un workflow via l'API
create_workflow_cli() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    
    echo -e "${BLUE}📥 Création du workflow: $workflow_name${NC}"
    
    # Créer le workflow via l'API
    response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -d @"$workflow_file")
    
    workflow_id=$(echo "$response" | jq -r '.id' 2>/dev/null)
    
    if [ "$workflow_id" != "null" ] && [ -n "$workflow_id" ]; then
        echo -e "${GREEN}✅ Workflow créé avec ID: $workflow_id${NC}"
        
        # Activer le workflow
        echo -e "${BLUE}🔄 Activation du workflow...${NC}"
        activate_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows/$workflow_id/activate")
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Workflow $workflow_name activé${NC}"
            return 0
        else
            echo -e "${RED}❌ Erreur lors de l'activation${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Erreur lors de la création${NC}"
        echo "Réponse: $response"
        return 1
    fi
}

# Fonction pour lister les workflows
list_workflows_cli() {
    echo -e "${BLUE}📋 Liste des workflows:${NC}"
    workflows_response=$(curl -s -X GET "$N8N_URL/api/v1/workflows")
    
    echo "$workflows_response" | jq -r '.data[] | "\(.name) - \(if .active then "Actif" else "Inactif" end)"' 2>/dev/null
}

# Fonction pour tester les webhooks
test_webhooks_cli() {
    echo ""
    echo -e "${YELLOW}🧪 Test des webhooks après activation...${NC}"
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
    fi
}

# Main execution
echo -e "${BLUE}🚀 Démarrage de l'activation N8N via CLI...${NC}"

# Attendre que N8N soit prêt
if ! wait_for_n8n; then
    echo -e "${RED}❌ Impossible de se connecter à N8N${NC}"
    exit 1
fi

# Créer et activer les workflows
echo ""
echo -e "${YELLOW}🔄 Création et activation des workflows...${NC}"

workflows_dir="/opt/orientationpro/workflows"
success_count=0
total_count=0

for workflow_file in "$workflows_dir"/*.json; do
    if [ -f "$workflow_file" ]; then
        total_count=$((total_count + 1))
        if create_workflow_cli "$workflow_file"; then
            success_count=$((success_count + 1))
        fi
        echo ""
    fi
done

echo ""
echo -e "${YELLOW}📊 Résumé de l'activation:${NC}"
echo -e "${GREEN}✅ Workflows créés et activés: $success_count/$total_count${NC}"

# Lister les workflows
echo ""
list_workflows_cli

# Tester les webhooks
test_webhooks_cli

echo ""
echo -e "${GREEN}🎉 Activation N8N via CLI terminée !${NC}"
echo -e "${BLUE}🌐 Accédez à N8N: $N8N_URL${NC}"
echo -e "${BLUE}👤 Identifiants: $N8N_USER / $N8N_PASS${NC}"
echo ""
echo -e "${YELLOW}📋 Workflows disponibles:${NC}"
echo "• Test Completion - Traitement automatique des résultats de tests"
echo "• User Registration - Automatisation de l'inscription des utilisateurs"
echo "• CV Analysis - Analyse automatique des CV"
echo "• Email Notifications - Gestion des emails"
echo "• Appointment Reminder - Rappels automatiques de rendez-vous"
echo ""
echo -e "${BLUE}📚 Documentation: /opt/orientationpro/docs/N8N_INTEGRATION.md${NC}" 