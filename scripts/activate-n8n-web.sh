#!/bin/bash

echo "🌐 Activation N8N via Interface Web"
echo "=================================="

# Vérifier que N8N est accessible
echo "🔍 Vérification de l'accès à N8N..."
if curl -s http://localhost:5678 > /dev/null; then
    echo "✅ N8N est accessible sur http://localhost:5678"
else
    echo "❌ N8N n'est pas accessible"
    echo "⏳ Attente du démarrage..."
    sleep 10
    if curl -s http://localhost:5678 > /dev/null; then
        echo "✅ N8N est maintenant accessible"
    else
        echo "❌ N8N n'est toujours pas accessible"
        echo "Vérifiez les logs: docker-compose -f /opt/n8n/docker-compose.yml logs n8n"
        exit 1
    fi
fi

echo ""
echo "📋 Instructions d'activation via l'interface web:"
echo "================================================"
echo ""
echo "1. 🌐 Ouvrez votre navigateur et allez sur:"
echo "   http://localhost:5678"
echo ""
echo "2. 🔐 Connectez-vous avec:"
echo "   Utilisateur: admin"
echo "   Mot de passe: orientationpro2024"
echo ""
echo "3. 📁 Importez les workflows:"
echo "   - Cliquez sur 'Workflows' dans le menu"
echo "   - Cliquez sur 'Import from file'"
echo "   - Sélectionnez les fichiers depuis /opt/orientationpro/workflows/"
echo ""
echo "4. ✅ Activez chaque workflow:"
echo "   - Ouvrez chaque workflow importé"
echo "   - Cliquez sur le toggle 'Active' (en haut à droite)"
echo "   - Le toggle devient vert quand le workflow est actif"
echo ""
echo "📁 Fichiers de workflows à importer:"
ls -la /opt/orientationpro/workflows/*.json | while read -r line; do
    echo "   • $(basename "$line")"
done

echo ""
echo "🧪 Après activation, testez avec:"
echo "   ./test-workflows-activated.sh"
echo ""
echo "📚 Documentation complète:"
echo "   /opt/orientationpro/docs/N8N_INTEGRATION.md"
echo ""
echo "🎯 Workflows disponibles:"
echo "   • Test Completion - Traitement automatique des résultats de tests"
echo "   • User Registration - Automatisation de l'inscription des utilisateurs"
echo "   • CV Analysis - Analyse automatique des CV"
echo "   • Email Notifications - Gestion des emails"
echo "   • Appointment Reminder - Rappels automatiques de rendez-vous" 