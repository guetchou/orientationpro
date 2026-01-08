#!/bin/bash

echo "🚀 Activation N8N via CLI"

# Configuration
N8N_URL="http://localhost:5678"
N8N_USER="admin"
N8N_PASS="orientationpro2024"

# Fonction pour obtenir le token d'authentification
get_auth_token() {
    echo "🔐 Authentification à N8N..."
    
    # Tentative de connexion pour obtenir le token
    auth_response=$(curl -s -X POST "$N8N_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$N8N_USER\",\"password\":\"$N8N_PASS\"}")
    
    token=$(echo "$auth_response" | jq -r '.accessToken' 2>/dev/null)
    
    if [ "$token" != "null" ] && [ -n "$token" ]; then
        echo "✅ Authentification réussie"
        echo "$token"
    else
        echo "❌ Échec de l'authentification"
        return 1
    fi
}

# Fonction pour créer un workflow
create_workflow() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    local token=$2
    
    echo "📥 Création du workflow: $workflow_name"
    
    # Créer le workflow
    create_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d @"$workflow_file")
    
    workflow_id=$(echo "$create_response" | jq -r '.id' 2>/dev/null)
    
    if [ "$workflow_id" != "null" ] && [ -n "$workflow_id" ]; then
        echo "✅ Workflow créé avec ID: $workflow_id"
        
        # Activer le workflow
        activate_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows/$workflow_id/activate" \
            -H "Authorization: Bearer $token")
        
        if [ $? -eq 0 ]; then
            echo "✅ Workflow $workflow_name activé"
            return 0
        else
            echo "❌ Erreur lors de l'activation"
            return 1
        fi
    else
        echo "❌ Erreur lors de la création"
        echo "Réponse: $create_response"
        return 1
    fi
}

# Fonction pour lister les workflows
list_workflows() {
    local token=$1
    
    echo "📋 Liste des workflows:"
    workflows_response=$(curl -s -X GET "$N8N_URL/api/v1/workflows" \
        -H "Authorization: Bearer $token")
    
    echo "$workflows_response" | jq -r '.data[] | "\(.name) - \(if .active then "Actif" else "Inactif" end)"' 2>/dev/null
}

# Fonction pour activer un workflow par ID
activate_workflow_by_id() {
    local workflow_id=$1
    local token=$2
    
    echo "🔄 Activation du workflow ID: $workflow_id"
    
    activate_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows/$workflow_id/activate" \
        -H "Authorization: Bearer $token")
    
    if [ $? -eq 0 ]; then
        echo "✅ Workflow activé"
        return 0
    else
        echo "❌ Erreur lors de l'activation"
        return 1
    fi
}

# Fonction pour tester les webhooks
test_webhooks() {
    echo ""
    echo "🧪 Test des webhooks après activation..."
    
    # Test Test Completion
    echo "📋 Test du webhook Test Completion..."
    response=$(curl -s -w "%{http_code}" -X POST "$N8N_URL/webhook/test-completion" \
        -H "Content-Type: application/json" \
        -d '{"testType": "riasec", "userId": "test-123", "results": {"realistic": 75}}')
    
    http_code="${response: -3}"
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ Test Completion: Fonctionne"
    else
        echo "❌ Test Completion: Erreur HTTP $http_code"
    fi
    
    # Test User Registration
    echo "📋 Test du webhook User Registration..."
    response=$(curl -s -w "%{http_code}" -X POST "$N8N_URL/webhook/user-registration" \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com", "firstName": "Test", "lastName": "User"}')
    
    http_code="${response: -3}"
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ User Registration: Fonctionne"
    else
        echo "❌ User Registration: Erreur HTTP $http_code"
    fi
}

# Main execution
echo "🚀 Démarrage de l'activation N8N via CLI..."

# Vérifier que N8N est accessible
echo "🌐 Vérification de l'accès à N8N..."
if curl -s "$N8N_URL" > /dev/null; then
    echo "✅ N8N est accessible"
else
    echo "❌ N8N n'est pas accessible"
    exit 1
fi

# Obtenir le token d'authentification
token=$(get_auth_token)
if [ $? -ne 0 ]; then
    echo "❌ Impossible d'obtenir le token d'authentification"
    echo "Tentative d'activation sans authentification..."
    token=""
fi

# Créer et activer les workflows
echo ""
echo "🔄 Création et activation des workflows..."

workflows_dir="/opt/orientationpro/workflows"
success_count=0
total_count=0

for workflow_file in "$workflows_dir"/*.json; do
    if [ -f "$workflow_file" ]; then
        total_count=$((total_count + 1))
        if create_workflow "$workflow_file" "$token"; then
            success_count=$((success_count + 1))
        fi
        echo ""
    fi
done

echo ""
echo "📊 Résumé de l'activation:"
echo "✅ Workflows activés: $success_count/$total_count"

# Lister les workflows
if [ -n "$token" ]; then
    echo ""
    list_workflows "$token"
fi

# Tester les webhooks
test_webhooks

echo ""
echo "🎉 Activation N8N via CLI terminée !"
echo "🌐 Accédez à N8N: $N8N_URL"
echo "👤 Identifiants: $N8N_USER / $N8N_PASS" 