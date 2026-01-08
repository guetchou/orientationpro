#!/bin/bash

echo "🚀 Configuration de l'environnement de test - Orientation Pro Congo"
echo "=================================================================="

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

print_status "Configuration de l'environnement de test..."

# 1. Vérifier et démarrer Supabase
print_status "Vérification de Supabase..."
if ! supabase status &> /dev/null; then
    print_status "Démarrage de Supabase..."
    supabase start
    print_success "Supabase démarré"
else
    print_success "Supabase est déjà en cours d'exécution"
fi

# 2. Vérifier les dépendances
print_status "Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    print_status "Installation des dépendances..."
    npm install
    print_success "Dépendances installées"
else
    print_success "Dépendances déjà installées"
fi

# 3. Créer les comptes de test
print_status "Création des comptes de test..."
if [ -f "create-test-accounts.js" ]; then
    node create-test-accounts.js create
    print_success "Comptes de test créés"
else
    print_warning "Script create-test-accounts.js non trouvé"
fi

# 4. Démarrer le backend si le dossier existe
if [ -d "backend" ]; then
    print_status "Vérification du backend..."
    
    # Vérifier si le backend est déjà en cours d'exécution
    if pgrep -f "node.*server.js" > /dev/null; then
        print_success "Backend déjà en cours d'exécution"
    else
        print_status "Démarrage du backend..."
        
        # Vérifier si les dépendances du backend sont installées
        if [ ! -d "backend/node_modules" ]; then
            print_status "Installation des dépendances du backend..."
            cd backend && npm install && cd ..
        fi
        
        # Démarrer le backend en arrière-plan
        cd backend
        nohup node src/server.js > ../backend.log 2>&1 &
        BACKEND_PID=$!
        cd ..
        
        # Attendre un peu pour que le backend démarre
        sleep 3
        
        # Vérifier si le backend a démarré correctement
        if curl -s http://localhost:6465/health > /dev/null 2>&1; then
            print_success "Backend démarré avec succès (PID: $BACKEND_PID)"
            echo $BACKEND_PID > backend.pid
        else
            print_warning "Le backend pourrait ne pas être démarré correctement"
        fi
    fi
else
    print_warning "Dossier backend non trouvé"
fi

# 5. Démarrer l'application frontend
print_status "Démarrage de l'application frontend..."
if pgrep -f "vite.*dev" > /dev/null; then
    print_success "Frontend déjà en cours d'exécution"
else
    print_status "Démarrage du frontend..."
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    print_success "Frontend démarré (PID: $FRONTEND_PID)"
fi

# 6. Afficher les informations de connexion
echo ""
echo "🎯 Environnement de test configuré !"
echo "===================================="
echo ""
echo "📱 URLs d'accès :"
echo "   • Application: http://localhost:8045"
echo "   • Supabase Studio: http://localhost:55511"
echo "   • Backend API: http://localhost:6465"
echo ""
echo "🧪 Comptes de test :"
echo "   • 👤 Utilisateur: user@example.com / password123"
echo "   • 🛡️ Admin: admin@example.com / admin123"
echo "   • 👨‍💼 Conseiller: conseiller@example.com / conseiller123"
echo "   • 🔴 Super Admin: superadmin@example.com / superadmin123"
echo ""
echo "🛠️ Commandes utiles :"
echo "   • Voir les logs backend: tail -f backend.log"
echo "   • Voir les logs frontend: tail -f frontend.log"
echo "   • Arrêter le backend: kill \$(cat backend.pid)"
echo "   • Arrêter le frontend: kill \$(cat frontend.pid)"
echo "   • Recréer les comptes: node create-test-accounts.js create"
echo "   • Vérifier les comptes: node create-test-accounts.js check"
echo "   • Supprimer les comptes: node create-test-accounts.js delete"
echo ""
echo "✅ Configuration terminée !"
echo "   Accédez à http://localhost:8045 pour commencer à tester" 