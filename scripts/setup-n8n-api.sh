#!/bin/bash

echo "🔧 Configuration API N8N et activation des workflows"

# Configuration
N8N_URL="http://localhost:5678"
N8N_USER="admin"
N8N_PASS="orientationpro2024"

# Générer une clé API
API_KEY="orientationpro-n8n-key-$(date +%s)"

echo "🔑 Génération de la clé API: $API_KEY"

# Fonction pour configurer l'API key via les variables d'environnement
setup_api_key() {
    echo "⚙️ Configuration de l'API key..."
    
    # Arrêter N8N
    echo "🛑 Arrêt de N8N..."
    docker-compose -f /opt/n8n/docker-compose.yml down
    
    # Modifier le docker-compose.yml pour ajouter l'API key
    echo "📝 Modification du docker-compose.yml..."
    sed -i "s/N8N_ENCRYPTION_KEY=your-encryption-key-here/N8N_ENCRYPTION_KEY=$API_KEY/" /opt/n8n/docker-compose.yml
    
    # Ajouter la variable API key
    if ! grep -q "N8N_API_KEY" /opt/n8n/docker-compose.yml; then
        sed -i '/N8N_ENCRYPTION_KEY/a\      - N8N_API_KEY='$API_KEY'' /opt/n8n/docker-compose.yml
    fi
    
    # Redémarrer N8N
    echo "🚀 Redémarrage de N8N avec API key..."
    docker-compose -f /opt/n8n/docker-compose.yml up -d
    
    # Attendre que N8N soit prêt
    echo "⏳ Attente du démarrage de N8N..."
    sleep 30
}

# Fonction pour créer un workflow avec API key
create_workflow_with_api_key() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    
    echo "📥 Création du workflow: $workflow_name"
    
    # Créer le workflow avec API key
    create_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -d @"$workflow_file")
    
    workflow_id=$(echo "$create_response" | jq -r '.id' 2>/dev/null)
    
    if [ "$workflow_id" != "null" ] && [ -n "$workflow_id" ]; then
        echo "✅ Workflow créé avec ID: $workflow_id"
        
        # Activer le workflow
        activate_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows/$workflow_id/activate" \
            -H "X-N8N-API-KEY: $API_KEY")
        
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
list_workflows_with_api_key() {
    echo "📋 Liste des workflows:"
    workflows_response=$(curl -s -X GET "$N8N_URL/api/v1/workflows" \
        -H "X-N8N-API-KEY: $API_KEY")
    
    echo "$workflows_response" | jq -r '.data[] | "\(.name) - \(if .active then "Actif" else "Inactif" end)"' 2>/dev/null
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
echo "🚀 Configuration API N8N..."

# Configurer l'API key
setup_api_key

# Vérifier que N8N est accessible
echo "🌐 Vérification de l'accès à N8N..."
if curl -s "$N8N_URL" > /dev/null; then
    echo "✅ N8N est accessible"
else
    echo "❌ N8N n'est pas accessible"
    exit 1
fi

# Créer et activer les workflows
echo ""
echo "🔄 Création et activation des workflows avec API key..."

workflows_dir="/opt/orientationpro/workflows"
success_count=0
total_count=0

for workflow_file in "$workflows_dir"/*.json; do
    if [ -f "$workflow_file" ]; then
        total_count=$((total_count + 1))
        if create_workflow_with_api_key "$workflow_file"; then
            success_count=$((success_count + 1))
        fi
        echo ""
    fi
done

echo ""
echo "📊 Résumé de l'activation:"
echo "✅ Workflows activés: $success_count/$total_count"

# Lister les workflows
echo ""
list_workflows_with_api_key

# Tester les webhooks
test_webhooks

echo ""
echo "🎉 Configuration API N8N terminée !"
echo "🔑 API Key: $API_KEY"
echo "🌐 Accédez à N8N: $N8N_URL"
echo "👤 Identifiants: $N8N_USER / $N8N_PASS"
echo ""
echo "📋 Pour utiliser l'API key dans vos scripts:"
echo "export N8N_API_KEY='$API_KEY'" 