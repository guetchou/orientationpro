#!/bin/bash

echo "🚀 Injection des Workflows N8N via API CLI"

# Configuration
N8N_URL="http://localhost:5678"
WORKFLOWS_DIR="/opt/orientationpro/workflows"

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

# Fonction pour obtenir un token d'authentification
get_auth_token() {
    echo -e "${BLUE}🔐 Obtention du token d'authentification...${NC}"
    
    # Essayer d'obtenir un token via l'API de session
    response=$(curl -s -X POST "$N8N_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin",
            "password": "orientationpro2024"
        }')
    
    token=$(echo "$response" | jq -r '.token' 2>/dev/null)
    
    if [ "$token" != "null" ] && [ -n "$token" ]; then
        echo -e "${GREEN}✅ Token obtenu${NC}"
        echo "$token"
        return 0
    else
        echo -e "${YELLOW}⚠️ Impossible d'obtenir un token, utilisation de l'API sans authentification${NC}"
        echo ""
        return 1
    fi
}

# Fonction pour créer un workflow avec authentification
create_workflow_with_auth() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    local auth_token=$2
    
    echo -e "${BLUE}📥 Création du workflow: $workflow_name${NC}"
    
    # Préparer les headers d'authentification
    if [ -n "$auth_token" ]; then
        auth_header="-H \"Authorization: Bearer $auth_token\""
    else
        auth_header=""
    fi
    
    # Créer le workflow
    response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        $auth_header \
        -d @"$workflow_file")
    
    workflow_id=$(echo "$response" | jq -r '.id' 2>/dev/null)
    
    if [ "$workflow_id" != "null" ] && [ -n "$workflow_id" ]; then
        echo -e "${GREEN}✅ Workflow créé avec ID: $workflow_id${NC}"
        
        # Activer le workflow
        echo -e "${BLUE}🔄 Activation du workflow...${NC}"
        activate_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows/$workflow_id/activate" \
            $auth_header)
        
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

# Fonction pour créer un workflow sans authentification (mode développement)
create_workflow_no_auth() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    
    echo -e "${BLUE}📥 Création du workflow: $workflow_name (mode développement)${NC}"
    
    # Essayer de créer le workflow sans authentification
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
list_workflows() {
    echo -e "${BLUE}📋 Liste des workflows:${NC}"
    workflows_response=$(curl -s -X GET "$N8N_URL/api/v1/workflows")
    
    echo "$workflows_response" | jq -r '.data[] | "\(.name) - \(if .active then "Actif" else "Inactif" end)"' 2>/dev/null
}

# Main execution
echo -e "${BLUE}🚀 Démarrage de l'injection des workflows...${NC}"

# Obtenir le token d'authentification
auth_token=$(get_auth_token)

# Créer et activer les workflows
echo ""
echo -e "${YELLOW}🔄 Création et activation des workflows...${NC}"

workflows_dir="/opt/orientationpro/workflows"
success_count=0
total_count=0

for workflow_file in "$workflows_dir"/*.json; do
    if [ -f "$workflow_file" ]; then
        total_count=$((total_count + 1))
        
        if [ -n "$auth_token" ]; then
            if create_workflow_with_auth "$workflow_file" "$auth_token"; then
                success_count=$((success_count + 1))
            fi
        else
            if create_workflow_no_auth "$workflow_file"; then
                success_count=$((success_count + 1))
            fi
        fi
        echo ""
    fi
done

echo ""
echo -e "${YELLOW}📊 Résumé de l'injection:${NC}"
echo -e "${GREEN}✅ Workflows créés et activés: $success_count/$total_count${NC}"

# Lister les workflows
echo ""
list_workflows

echo ""
echo -e "${GREEN}🎉 Injection des workflows terminée !${NC}"
echo -e "${BLUE}🌐 Accédez à N8N: $N8N_URL${NC}"
echo -e "${BLUE}👤 Identifiants: admin / orientationpro2024${NC}"
echo ""
echo -e "${YELLOW}📋 Workflows disponibles:${NC}"
echo "• Test Completion - Traitement automatique des résultats de tests"
echo "• User Registration - Automatisation de l'inscription des utilisateurs"
echo "• CV Analysis - Analyse automatique des CV"
echo "• Email Notifications - Gestion des emails"
echo "• Appointment Reminder - Rappels automatiques de rendez-vous"
echo ""
echo -e "${BLUE}📚 Documentation: /opt/orientationpro/docs/N8N_INTEGRATION.md${NC}" 