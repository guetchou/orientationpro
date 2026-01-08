#!/bin/bash

echo "🚀 Démarrage d'Orientation Pro Congo (Version Propre)..."

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "dev-start.sh" ]; then
    echo "❌ Veuillez exécuter ce script depuis le dossier du projet"
    exit 1
fi

# Démarrer avec le script existant
echo "🔧 Utilisation du script de démarrage existant..."
./dev-start.sh

echo ""
echo "✅ Projet démarré avec succès !"
echo "🌐 URLs d'accès :"
echo "   Frontend: http://localhost:8045"
echo "   Backend: http://localhost:6465"
echo "   Supabase: http://localhost:54321"
