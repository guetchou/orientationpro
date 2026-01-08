#!/bin/bash

echo "🚀 Démarrage rapide - Orientation Pro Congo"
echo "=============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis le répertoire racine du projet"
    exit 1
fi

print_status "Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

# Vérifier Supabase CLI
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI n'est pas installé. Installation..."
    npm install -g supabase
fi

print_success "Environnement vérifié"

# Vérifier les dépendances
print_status "Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    print_status "Installation des dépendances..."
    npm install
    print_success "Dépendances installées"
else
    print_success "Dépendances déjà installées"
fi

# Vérifier Supabase
print_status "Vérification de Supabase..."
if supabase status &> /dev/null; then
    print_success "Supabase est en cours d'exécution"
else
    print_status "Démarrage de Supabase..."
    supabase start
    print_success "Supabase démarré"
fi

# Vérifier le fichier .env
print_status "Vérification de la configuration..."
if [ -f ".env" ]; then
    if grep -q "NODE_ENV=development" .env; then
        print_success "Configuration .env correcte"
    else
        print_warning "NODE_ENV n'est pas configuré en mode development"
        sed -i 's/NODE_ENV=production/NODE_ENV=development/' .env
        print_success "NODE_ENV corrigé"
    fi
else
    print_error "Fichier .env manquant"
    exit 1
fi

# Test de santé de l'application
print_status "Test de santé de l'application..."
if [ -f "test-app-health.cjs" ]; then
    node test-app-health.cjs
else
    print_warning "Script de test de santé non trouvé"
fi

echo ""
echo "🎯 Prochaines étapes :"
echo "======================"
echo "1. Démarrer l'application : npm run dev"
echo "2. Accéder à l'application : http://localhost:8045"
echo "3. Supabase Studio : http://localhost:55511"
echo "4. Consulter le guide : cat GUIDE_REPRISE.md"
echo ""

# Demander si l'utilisateur veut démarrer l'application
read -p "Voulez-vous démarrer l'application maintenant ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Démarrage de l'application..."
    npm run dev
else
    print_success "Configuration terminée !"
    echo ""
    echo "Pour démarrer l'application :"
    echo "  npm run dev"
    echo ""
    echo "Pour plus d'informations :"
    echo "  cat GUIDE_REPRISE.md"
fi 