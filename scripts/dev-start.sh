#!/bin/bash

# Script de démarrage en mode développement
# Usage: ./dev-start.sh [frontend|backend|full|stop]

set -e

APP_DIR="/opt/orientationpro"
BACKEND_DIR="$APP_DIR/backend"

# Fonction pour logger
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log "❌ Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log "❌ npm n'est pas installé"
        exit 1
    fi
    
    log "✅ Prérequis vérifiés"
}

# Fonction pour démarrer la base de données
start_database() {
    log "Démarrage de la base de données..."
    
    cd "$APP_DIR"
    docker-compose up -d db
    
    # Attendre que MySQL soit prêt
    log "Attente du démarrage de MySQL..."
    sleep 10
    
    log "✅ Base de données démarrée"
}

# Fonction pour démarrer le backend
start_backend() {
    log "Démarrage du backend en mode développement..."
    
    cd "$BACKEND_DIR"
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        log "Installation des dépendances backend..."
        npm install
    fi
    
    # Démarrer le serveur de développement
    log "Démarrage du serveur backend..."
    npm run dev &
    BACKEND_PID=$!
    
    # Attendre que le backend soit prêt
    sleep 5
    
    log "✅ Backend démarré sur http://localhost:6464"
    echo $BACKEND_PID > /tmp/backend.pid
}

# Fonction pour démarrer le frontend
start_frontend() {
    log "Démarrage du frontend en mode développement..."
    
    cd "$APP_DIR"
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        log "Installation des dépendances frontend..."
        npm install
    fi
    
    # Démarrer le serveur de développement
    log "Démarrage du serveur frontend..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Attendre que le frontend soit prêt
    sleep 10
    
    log "✅ Frontend démarré sur http://localhost:5111"
    echo $FRONTEND_PID > /tmp/frontend.pid
}

# Fonction pour arrêter les services
stop_dev_services() {
    log "Arrêt des services de développement..."
    
    # Arrêter le frontend
    if [ -f "/tmp/frontend.pid" ]; then
        FRONTEND_PID=$(cat /tmp/frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            log "✅ Frontend arrêté"
        fi
        rm -f /tmp/frontend.pid
    fi
    
    # Arrêter le backend
    if [ -f "/tmp/backend.pid" ]; then
        BACKEND_PID=$(cat /tmp/backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            log "✅ Backend arrêté"
        fi
        rm -f /tmp/backend.pid
    fi
    
    # Arrêter la base de données
    cd "$APP_DIR"
    docker-compose stop db
    log "✅ Base de données arrêtée"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [frontend|backend|full|stop|help]"
    echo ""
    echo "Commandes disponibles:"
    echo "  frontend - Démarrer seulement le frontend (nécessite backend + DB)"
    echo "  backend  - Démarrer backend + base de données"
    echo "  full     - Démarrer frontend + backend + base de données"
    echo "  stop     - Arrêter tous les services de développement"
    echo "  help     - Afficher cette aide"
    echo ""
    echo "URLs de développement:"
    echo "  Frontend: http://localhost:5111"
    echo "  Backend:  http://localhost:6464/api"
    echo "  Database: localhost:3310"
}

# Vérifier les arguments
case "${1:-help}" in
    frontend)
        check_prerequisites
        start_frontend
        ;;
    backend)
        check_prerequisites
        start_database
        start_backend
        ;;
    full)
        check_prerequisites
        start_database
        start_backend
        start_frontend
        log "🎉 Tous les services démarrés !"
        log "🌐 Frontend: http://localhost:5111"
        log "🔧 Backend: http://localhost:6464/api"
        ;;
    stop)
        stop_dev_services
        ;;
    help|*)
        show_help
        ;;
esac 