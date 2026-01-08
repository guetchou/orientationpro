#!/bin/bash

echo "🚀 Import des workflows N8N maintenant que l'installation est terminée"

# Configuration
N8N_URL="http://localhost:5678"
N8N_USER="admin"
N8N_PASS="orientationpro2024"

# Fonction pour attendre que N8N soit prêt
wait_for_n8n() {
    echo "⏳ Attente que N8N soit complètement prêt..."
    for i in {1..30}; do
        if curl -s "$N8N_URL" > /dev/null; then
            echo "✅ N8N est accessible sur $N8N_URL"
            return 0
        else
            echo "⏳ Tentative $i/30 - N8N n'est pas encore prêt..."
            sleep 5
        fi
    done
    echo "❌ N8N n'est pas accessible après 30 tentatives"
    return 1
}

# Fonction pour créer un workflow via l'API
create_workflow_api() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    
    echo "📥 Création du workflow: $workflow_name"
    
    # Créer le workflow via l'API
    response=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -d @"$workflow_file")
    
    workflow_id=$(echo "$response" | jq -r '.id' 2>/dev/null)
    
    if [ "$workflow_id" != "null" ] && [ -n "$workflow_id" ]; then
        echo "✅ Workflow créé avec ID: $workflow_id"
        
        # Activer le workflow
        activate_response=$(curl -s -X POST "$N8N_URL/api/v1/workflows/$workflow_id/activate")
        
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
list_workflows() {
    echo "📋 Liste des workflows:"
    workflows_response=$(curl -s -X GET "$N8N_URL/api/v1/workflows")
    
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
echo "🚀 Démarrage de l'import des workflows..."

# Attendre que N8N soit prêt
if ! wait_for_n8n; then
    echo "❌ Impossible de se connecter à N8N"
    echo ""
    echo "📋 Instructions manuelles:"
    echo "1. Accédez à http://localhost:5678"
    echo "2. Connectez-vous avec admin/orientationpro2024"
    echo "3. Importez les workflows depuis /opt/orientationpro/workflows/"
    echo "4. Activez chaque workflow"
    exit 1
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
        if create_workflow_api "$workflow_file"; then
            success_count=$((success_count + 1))
        fi
        echo ""
    fi
done

echo ""
echo "📊 Résumé de l'import:"
echo "✅ Workflows créés et activés: $success_count/$total_count"

# Lister les workflows
echo ""
list_workflows

# Tester les webhooks
test_webhooks

echo ""
echo "🎉 Import des workflows terminé !"
echo "🌐 Accédez à N8N: $N8N_URL"
echo "👤 Identifiants: $N8N_USER / $N8N_PASS"
echo ""
echo "📋 Workflows disponibles:"
echo "• Test Completion - Traitement automatique des résultats de tests"
echo "• User Registration - Automatisation de l'inscription des utilisateurs"
echo "• CV Analysis - Analyse automatique des CV"
echo "• Email Notifications - Gestion des emails"
echo "• Appointment Reminder - Rappels automatiques de rendez-vous" 