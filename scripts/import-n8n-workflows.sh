#!/bin/bash

echo "🚀 Import des workflows N8N pour Orientation Pro Congo"

# Attendre que N8N soit prêt
echo "⏳ Vérification que N8N est accessible..."
until curl -s http://localhost:5678 > /dev/null; do
    echo "⏳ En attente de N8N..."
    sleep 5
done

echo "✅ N8N est accessible"

# Créer le dossier des workflows s'il n'existe pas
mkdir -p /opt/n8n/workflows

# Copier les workflows vers le dossier N8N
echo "📁 Copie des workflows..."
cp /opt/orientationpro/workflows/*.json /opt/n8n/workflows/

# Fonction pour importer un workflow
import_workflow() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)
    
    echo "📥 Import du workflow: $workflow_name"
    
    # Créer l'API key pour N8N (si nécessaire)
    # Note: Dans un environnement de production, vous devriez utiliser une vraie API key
    
    # Importer le workflow via l'API N8N
    curl -X POST "http://localhost:5678/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -H "X-N8N-API-KEY: your-api-key" \
        -d @"$workflow_file" \
        --silent \
        --show-error
    
    if [ $? -eq 0 ]; then
        echo "✅ Workflow $workflow_name importé avec succès"
    else
        echo "❌ Erreur lors de l'import du workflow $workflow_name"
    fi
}

# Importer tous les workflows
echo ""
echo "🔄 Import des workflows..."

for workflow_file in /opt/n8n/workflows/*.json; do
    if [ -f "$workflow_file" ]; then
        import_workflow "$workflow_file"
    fi
done

echo ""
echo "🎉 Import des workflows terminé !"
echo ""
echo "📋 Workflows disponibles:"
echo "1. Test Completion Workflow - Traitement automatique des résultats de tests"
echo "2. User Registration Workflow - Automatisation de l'inscription des utilisateurs"
echo "3. Appointment Reminder Workflow - Rappels automatiques de rendez-vous"
echo "4. CV Analysis Workflow - Analyse automatique des CV"
echo "5. Email Notifications Workflow - Gestion des notifications par email"
echo ""
echo "🌐 Accédez à N8N: http://localhost:5678"
echo "👤 Identifiants: admin / orientationpro2024"
echo ""
echo "📚 Documentation des workflows:"
echo "- Test Completion: Traite automatiquement les résultats de tests RIASEC, émotionnel, etc."
echo "- User Registration: Crée les comptes utilisateurs et envoie les emails de bienvenue"
echo "- Appointment Reminder: Envoie des rappels automatiques pour les rendez-vous"
echo "- CV Analysis: Analyse les CV et propose des opportunités d'emploi"
echo "- Email Notifications: Gère tous les types d'emails (bienvenue, résultats, rappels)" 