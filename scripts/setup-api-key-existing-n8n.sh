#!/bin/bash

echo "🔑 Configuration API Key pour N8N existant"

# Configuration
API_KEY="orientationpro-n8n-api-key-$(date +%s)"
CONTAINER_NAME=$(docker ps | grep n8n | awk '{print $NF}')

echo "🔑 API Key générée: $API_KEY"
echo "📦 Conteneur N8N: $CONTAINER_NAME"

# Fonction pour configurer l'API key
setup_api_key() {
    echo "⚙️ Configuration de l'API key..."
    
    # Arrêter le conteneur existant
    echo "🛑 Arrêt du conteneur N8N existant..."
    docker stop $CONTAINER_NAME
    
    # Créer un nouveau conteneur avec l'API key
    echo "🚀 Création d'un nouveau conteneur avec API key..."
    docker run -d \
        --name n8n-orientationpro-api \
        -p 5678:5678 \
        -e N8N_BASIC_AUTH_ACTIVE=true \
        -e N8N_BASIC_AUTH_USER=admin \
        -e N8N_BASIC_AUTH_PASSWORD=orientationpro2024 \
        -e N8N_HOST=localhost \
        -e N8N_PORT=5678 \
        -e N8N_PROTOCOL=http \
        -e N8N_SECURE_COOKIE=false \
        -e N8N_API_KEY=$API_KEY \
        -e N8N_ENCRYPTION_KEY=orientationpro-encryption-key-2024 \
        -e N8N_DATABASE_TYPE=sqlite \
        -e N8N_DATABASE_SQLITE_VACUUM_ON_STARTUP=true \
        -e N8N_DATABASE_SQLITE_DATABASE=/home/node/.n8n/database.sqlite \
        -e WEBHOOK_URL=http://localhost:5678/ \
        -e GENERIC_TIMEZONE=Europe/Paris \
        -e N8N_LOG_LEVEL=info \
        -e N8N_DIAGNOSTICS_ENABLED=false \
        -e N8N_METRICS=false \
        -e N8N_DEPLOYMENT_TYPE=docker \
        -e N8N_EDITOR_BASE_URL=http://localhost:5678 \
        -v n8n_data:/home/node/.n8n \
        n8nio/n8n:latest
    
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
    response=$(curl -s -X POST "http://localhost:5678/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -d @"$workflow_file")
    
    workflow_id=$(echo "$response" | jq -r '.id' 2>/dev/null)
    
    if [ "$workflow_id" != "null" ] && [ -n "$workflow_id" ]; then
        echo "✅ Workflow créé avec ID: $workflow_id"
        
        # Activer le workflow
        activate_response=$(curl -s -X POST "http://localhost:5678/api/v1/workflows/$workflow_id/activate" \
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
        echo "Réponse: $response"
        return 1
    fi
}

# Fonction pour lister les workflows
list_workflows_with_api_key() {
    echo "📋 Liste des workflows:"
    workflows_response=$(curl -s -X GET "http://localhost:5678/api/v1/workflows" \
        -H "X-N8N-API-KEY: $API_KEY")
    
    echo "$workflows_response" | jq -r '.data[] | "\(.name) - \(if .active then "Actif" else "Inactif" end)"' 2>/dev/null
}

# Main execution
echo "🚀 Configuration API Key pour N8N existant..."

# Configurer l'API key
setup_api_key

# Vérifier que N8N est accessible
echo "🌐 Vérification de l'accès à N8N..."
if curl -s http://localhost:5678 > /dev/null; then
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

echo ""
echo "🎉 Configuration API N8N terminée !"
echo "🔑 API Key: $API_KEY"
echo "🌐 Accédez à N8N: http://localhost:5678"
echo "👤 Identifiants: admin / orientationpro2024"
echo ""
echo "📋 Pour utiliser l'API key dans vos scripts:"
echo "export N8N_API_KEY='$API_KEY'" 