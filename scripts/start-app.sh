#!/bin/bash

# Script de démarrage automatique pour Orientation Pro Congo
# Usage: ./start-app.sh [start|stop|restart|status]

set -e

APP_DIR="/opt/orientationpro"
LOG_FILE="/var/log/orientationpro.log"

# Fonction pour logger
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Fonction pour vérifier si Docker est en cours d'exécution
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log "ERREUR: Docker n'est pas en cours d'exécution"
        exit 1
    fi
}

# Fonction pour démarrer l'application
start_app() {
    log "Démarrage de l'application Orientation Pro Congo..."
    
    cd "$APP_DIR"
    
    # Vérifier que le fichier docker-compose.yml existe
    if [ ! -f "docker-compose.yml" ]; then
        log "ERREUR: docker-compose.yml non trouvé dans $APP_DIR"
        exit 1
    fi
    
    # Démarrer les services
    docker-compose up -d
    
    # Attendre que les services soient prêts
    log "Attente du démarrage des services..."
    sleep 30
    
    # Vérifier le statut des services
    if docker-compose ps | grep -q "Up"; then
        log "✅ Application démarrée avec succès"
        log "🌐 Frontend: http://localhost:7474"
        log "🔧 Backend: http://localhost:6464/api"
        log "📊 phpMyAdmin: http://localhost:8282"
        log "🗄️  Base de données: localhost:3310"
    else
        log "❌ Erreur lors du démarrage de l'application"
        exit 1
    fi
}

# Fonction pour arrêter l'application
stop_app() {
    log "Arrêt de l'application Orientation Pro Congo..."
    
    cd "$APP_DIR"
    docker-compose down
    
    log "✅ Application arrêtée"
}

# Fonction pour redémarrer l'application
restart_app() {
    log "Redémarrage de l'application Orientation Pro Congo..."
    stop_app
    sleep 5
    start_app
}

# Fonction pour afficher le statut
status_app() {
    log "Statut de l'application Orientation Pro Congo..."
    
    cd "$APP_DIR"
    docker-compose ps
    
    # Test de connectivité
    echo ""
    echo "Tests de connectivité:"
    
    if curl -s http://localhost:7474 >/dev/null 2>&1; then
        echo "✅ Frontend (port 7474): Accessible"
    else
        echo "❌ Frontend (port 7474): Non accessible"
    fi
    
    if curl -s http://localhost:6464/api/test/health >/dev/null 2>&1; then
        echo "✅ Backend (port 6464): Accessible"
    else
        echo "❌ Backend (port 6464): Non accessible"
    fi
    
    if curl -s http://localhost:8282 >/dev/null 2>&1; then
        echo "✅ phpMyAdmin (port 8282): Accessible"
    else
        echo "❌ phpMyAdmin (port 8282): Non accessible"
    fi
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [start|stop|restart|status|help]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start   - Démarrer l'application"
    echo "  stop    - Arrêter l'application"
    echo "  restart - Redémarrer l'application"
    echo "  status  - Afficher le statut des services"
    echo "  help    - Afficher cette aide"
    echo ""
    echo "URLs de l'application:"
    echo "  Frontend: http://localhost:7474"
    echo "  Backend:  http://localhost:6464/api"
    echo "  phpMyAdmin: http://localhost:8282"
}

# Vérifier les arguments
case "${1:-help}" in
    start)
        check_docker
        start_app
        ;;
    stop)
        check_docker
        stop_app
        ;;
    restart)
        check_docker
        restart_app
        ;;
    status)
        check_docker
        status_app
        ;;
    help|*)
        show_help
        ;;
esac 