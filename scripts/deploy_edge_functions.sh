#!/bin/bash

echo "🚀 Déploiement des Edge Functions pour Orientation Pro Congo"

# Vérifier que Supabase est démarré
echo "📋 Vérification de Supabase..."
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Supabase n'est pas démarré. Démarrage..."
    supabase start
fi

# Déployer les Edge Functions
echo "📦 Déploiement des Edge Functions..."

# Déployer test-analysis
echo "  - Déploiement de test-analysis..."
supabase functions deploy test-analysis --no-verify-jwt

# Déployer appointment-reminder
echo "  - Déploiement de appointment-reminder..."
supabase functions deploy appointment-reminder --no-verify-jwt

# Déployer cv-optimizer
echo "  - Déploiement de cv-optimizer..."
supabase functions deploy cv-optimizer --no-verify-jwt

# Déployer email-notifications
echo "  - Déploiement de email-notifications..."
supabase functions deploy email-notifications --no-verify-jwt

echo "✅ Déploiement terminé !"

# Afficher les URLs des fonctions
echo ""
echo "🌐 URLs des Edge Functions :"
echo "  - Test Analysis: http://localhost:54321/functions/v1/test-analysis"
echo "  - Appointment Reminder: http://localhost:54321/functions/v1/appointment-reminder"
echo "  - CV Optimizer: http://localhost:54321/functions/v1/cv-optimizer"
echo "  - Email Notifications: http://localhost:54321/functions/v1/email-notifications"

echo ""
echo "🧪 Tests des fonctions..."

# Test de la fonction test-analysis
echo "Test de test-analysis..."
curl -s -X POST 'http://localhost:54321/functions/v1/test-analysis' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -H 'Content-Type: application/json' \
  -d '{
    "test_data": {
      "test_type": "riasec",
      "results": {
        "R": 85,
        "I": 72,
        "A": 68,
        "S": 90,
        "E": 75,
        "C": 60
      }
    },
    "profile_id": "test-profile-id"
  }' | jq '.'

echo ""
echo "✅ Script terminé !" 