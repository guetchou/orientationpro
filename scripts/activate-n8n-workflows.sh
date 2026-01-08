#!/bin/bash

echo "🚀 Activation des workflows N8N pour Orientation Pro Congo"

# Attendre que N8N soit prêt
echo "⏳ Attente de N8N..."
sleep 10

# Fonction pour créer et activer un workflow
create_and_activate_workflow() {
    local workflow_name=$1
    local workflow_file=$2
    
    echo "📥 Création du workflow: $workflow_name"
    
    # Créer le workflow
    workflow_id=$(curl -s -X POST "http://localhost:5678/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -d @"$workflow_file" | jq -r '.id' 2>/dev/null)
    
    if [ "$workflow_id" != "null" ] && [ "$workflow_id" != "" ]; then
        echo "✅ Workflow créé avec ID: $workflow_id"
        
        # Activer le workflow
        activation_response=$(curl -s -X POST "http://localhost:5678/api/v1/workflows/$workflow_id/activate" \
            -H "Content-Type: application/json")
        
        if [ $? -eq 0 ]; then
            echo "✅ Workflow $workflow_name activé"
            return 0
        else
            echo "❌ Erreur lors de l'activation du workflow $workflow_name"
            return 1
        fi
    else
        echo "❌ Erreur lors de la création du workflow $workflow_name"
        return 1
    fi
}

# Créer et activer les workflows
echo ""
echo "🔄 Création et activation des workflows..."

# Workflow 1: Test Completion
create_and_activate_workflow "Test Completion" "/opt/orientationpro/workflows/test-completion-workflow.json"

# Workflow 2: User Registration
create_and_activate_workflow "User Registration" "/opt/orientationpro/workflows/user-registration-workflow.json"

# Workflow 3: CV Analysis
create_and_activate_workflow "CV Analysis" "/opt/orientationpro/workflows/cv-analysis-workflow.json"

# Workflow 4: Email Notifications
create_and_activate_workflow "Email Notifications" "/opt/orientationpro/workflows/email-notifications-workflow.json"

# Workflow 5: Appointment Reminder
create_and_activate_workflow "Appointment Reminder" "/opt/orientationpro/workflows/appointment-reminder-workflow.json"

echo ""
echo "⏳ Attente de l'activation des workflows..."
sleep 15

# Vérifier les workflows actifs
echo ""
echo "🔍 Vérification des workflows actifs..."
active_workflows=$(curl -s "http://localhost:5678/api/v1/workflows" | jq '.data[] | select(.active == true) | .name' 2>/dev/null)

if [ -n "$active_workflows" ]; then
    echo "✅ Workflows actifs:"
    echo "$active_workflows" | while read -r workflow; do
        echo "  • $workflow"
    done
else
    echo "❌ Aucun workflow actif trouvé"
fi

echo ""
echo "🌐 Accédez à N8N: http://localhost:5678"
echo "👤 Identifiants: admin / orientationpro2024"
echo ""
echo "📋 Pour activer manuellement les workflows:"
echo "1. Connectez-vous à N8N"
echo "2. Allez dans l'onglet 'Workflows'"
echo "3. Cliquez sur le toggle à droite de chaque workflow"
echo "4. Les workflows deviennent actifs (vert)"
echo ""
echo "🔗 URLs des webhooks:"
echo "• Test Completion: http://localhost:5678/webhook/test-completion"
echo "• User Registration: http://localhost:5678/webhook/user-registration"
echo "• CV Analysis: http://localhost:5678/webhook/cv-upload"
echo "• Email Notifications: http://localhost:5678/webhook/send-email" 