#!/bin/bash

echo "📊 Monitoring DEMO en Temps Réel"
echo "================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://localhost:8045"
BACKEND_URL="http://localhost:7474"
LOG_FILE="/tmp/demo-monitoring.log"

# Fonction pour afficher les métriques
show_metrics() {
    clear
    echo -e "${BLUE}📊 Monitoring DEMO - $(date)${NC}"
    echo "=========================================="
    echo ""
    
    # Métriques système
    echo -e "${YELLOW}🖥️  Système:${NC}"
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    echo -e "  CPU: ${cpu_usage}%"
    echo -e "  RAM: ${memory_usage}%"
    echo -e "  Disque: ${disk_usage}%"
    echo ""
    
    # Métriques réseau
    echo -e "${YELLOW}🌐 Réseau:${NC}"
    if curl -s "$FRONTEND_URL" > /dev/null; then
        echo -e "  Frontend: ${GREEN}✅ En ligne${NC}"
    else
        echo -e "  Frontend: ${RED}❌ Hors ligne${NC}"
    fi
    
    if curl -s "$BACKEND_URL" > /dev/null; then
        echo -e "  Backend: ${GREEN}✅ En ligne${NC}"
    else
        echo -e "  Backend: ${RED}❌ Hors ligne${NC}"
    fi
    echo ""
    
    # Métriques DEMO
    echo -e "${YELLOW}🔵 DEMO:${NC}"
    demo_users=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.users WHERE last_active > NOW() - INTERVAL '5 minutes';" 2>/dev/null || echo "0")
    demo_sessions=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.sessions WHERE created_at > NOW() - INTERVAL '1 hour';" 2>/dev/null || echo "0")
    demo_tests=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.test_results WHERE created_at > NOW() - INTERVAL '1 hour';" 2>/dev/null || echo "0")
    
    echo -e "  Utilisateurs actifs: ${demo_users}"
    echo -e "  Sessions (1h): ${demo_sessions}"
    echo -e "  Tests (1h): ${demo_tests}"
    echo ""
    
    # Alertes
    echo -e "${YELLOW}🚨 Alertes:${NC}"
    if [ "$cpu_usage" -gt 80 ]; then
        echo -e "  ${RED}⚠️  CPU élevé: ${cpu_usage}%${NC}"
    fi
    
    if [ "$memory_usage" -gt 80 ]; then
        echo -e "  ${RED}⚠️  RAM élevée: ${memory_usage}%${NC}"
    fi
    
    if [ "$disk_usage" -gt 80 ]; then
        echo -e "  ${RED}⚠️  Disque plein: ${disk_usage}%${NC}"
    fi
    
    if [ "$demo_users" -gt 50 ]; then
        echo -e "  ${PURPLE}📈 Utilisation DEMO élevée: ${demo_users} utilisateurs${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💡 Appuyez sur Ctrl+C pour arrêter${NC}"
}

# Fonction pour logger les événements
log_event() {
    local event=$1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $event" >> "$LOG_FILE"
}

# Boucle de monitoring
echo -e "${GREEN}🚀 Démarrage du monitoring DEMO...${NC}"
echo -e "${BLUE}📝 Logs: $LOG_FILE${NC}"
echo ""

while true; do
    show_metrics
    
    # Log des métriques importantes
    log_event "Monitoring check completed"
    
    # Attendre 5 secondes
    sleep 5
done
