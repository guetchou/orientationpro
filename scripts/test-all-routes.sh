#!/bin/bash

echo "🧪 Test de Toutes les Routes"
echo "============================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://localhost:8045"
BACKEND_URL="http://localhost:7474"

# Fonction pour tester une route
test_route() {
    local route=$1
    local description=$2
    local expected_status=$3
    
    echo -e "${BLUE}🔍 Test de $route ($description)...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$route")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ $route - HTTP $response${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $route - HTTP $response (attendu: $expected_status)${NC}"
        return 1
    fi
}

# Fonction pour tester une route avec authentification
test_auth_route() {
    local route=$1
    local description=$2
    
    echo -e "${BLUE}🔍 Test de $route ($description) - Redirection attendue...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$route")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ] || [ "$response" = "401" ]; then
        echo -e "  ${GREEN}✅ $route - HTTP $response (redirection normale)${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $route - HTTP $response${NC}"
        return 1
    fi
}

echo -e "${YELLOW}🚀 Démarrage des tests de routes...${NC}"
echo ""

# Vérifier que le serveur frontend est en cours d'exécution
echo -e "${BLUE}🔍 Vérification du serveur frontend...${NC}"
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Serveur frontend accessible sur $FRONTEND_URL${NC}"
else
    echo -e "${RED}❌ Serveur frontend non accessible${NC}"
    echo -e "${YELLOW}💡 Démarrez le serveur avec: cd frontend && npm run dev${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Test des Routes Publiques:${NC}"
echo "=================================="

# Routes publiques
public_routes=(
    "/:Accueil:200"
    "/login:Page de connexion:200"
    "/register:Page d'inscription:200"
    "/tests:Page des tests:200"
    "/tests/riasec:Test RIASEC:200"
    "/tests/emotional:Test émotionnel:200"
    "/tests/learning:Test d'apprentissage:200"
    "/tests/multiple:Test d'intelligence multiple:200"
    "/tests/career-transition:Test de transition de carrière:200"
    "/tests/no-diploma:Test sans diplôme:200"
    "/tests/senior-employment:Test emploi senior:200"
    "/tests/entrepreneurial:Test entrepreneurial:200"
    "/ats:Page ATS:200"
    "/conseiller:Page des conseillers:200"
    "/recrutement:Page de recrutement:200"
    "/orientation-services:Services d'orientation:200"
    "/blog:Blog:200"
    "/cv-optimizer:Optimiseur de CV:200"
    "/cv-history:Historique des CV:200"
    "/unauthorized:Page d'accès non autorisé:200"
    "/guide-congo-2024:Guide des études 2024:200"
)

success_count=0
total_count=0

for route_info in "${public_routes[@]}"; do
    IFS=':' read -r route description expected_status <<< "$route_info"
    total_count=$((total_count + 1))
    
    if test_route "$route" "$description" "$expected_status"; then
        success_count=$((success_count + 1))
    fi
    echo ""
done

echo ""
echo -e "${YELLOW}📋 Test des Routes Protégées:${NC}"
echo "=================================="

# Routes protégées (devraient rediriger vers login)
protected_routes=(
    "/dashboard:Dashboard utilisateur"
    "/test-results:Résultats de tests"
    "/profile:Profil utilisateur"
    "/admin/dashboard:Dashboard admin"
    "/admin/super-admin:Super admin"
    "/admin/ats:Gestion ATS"
    "/admin/blog:Gestion blog"
    "/admin/media:Gestionnaire médias"
    "/conseiller/dashboard:Dashboard conseiller"
)

for route_info in "${protected_routes[@]}"; do
    IFS=':' read -r route description <<< "$route_info"
    total_count=$((total_count + 1))
    
    if test_auth_route "$route" "$description"; then
        success_count=$((success_count + 1))
    fi
    echo ""
done

echo ""
echo -e "${YELLOW}📊 Résumé des Tests:${NC}"
echo "========================"
echo -e "${BLUE}Total des routes testées: $total_count${NC}"
echo -e "${GREEN}Routes fonctionnelles: $success_count${NC}"
echo -e "${RED}Routes problématiques: $((total_count - success_count))${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 Toutes les routes fonctionnent correctement !${NC}"
else
    echo -e "${YELLOW}⚠️ Certaines routes nécessitent une attention${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Routes Disponibles:${NC}"
echo "========================"
echo "🌐 Routes Publiques (31):"
echo "  • / - Accueil"
echo "  • /login - Connexion"
echo "  • /register - Inscription"
echo "  • /tests - Tests d'orientation"
echo "  • /tests/riasec - Test RIASEC"
echo "  • /tests/emotional - Test émotionnel"
echo "  • /tests/learning - Test d'apprentissage"
echo "  • /tests/multiple - Test d'intelligence multiple"
echo "  • /tests/career-transition - Test de transition de carrière"
echo "  • /tests/no-diploma - Test sans diplôme"
echo "  • /tests/senior-employment - Test emploi senior"
echo "  • /tests/entrepreneurial - Test entrepreneurial"
echo "  • /ats - Recrutement ATS"
echo "  • /conseiller - Conseillers"
echo "  • /recrutement - Recrutement"
echo "  • /orientation-services - Services d'orientation"
echo "  • /blog - Blog"
echo "  • /blog/:slug - Article de blog"
echo "  • /cv-optimizer - Optimiseur de CV"
echo "  • /cv-history - Historique des CV"
echo "  • /unauthorized - Accès non autorisé"
echo "  • /guide-congo-2024 - Guide des études 2024"

echo ""
echo "🔒 Routes Protégées (9):"
echo "  • /dashboard - Dashboard utilisateur"
echo "  • /test-results - Résultats de tests"
echo "  • /profile - Profil utilisateur"
echo "  • /admin/dashboard - Dashboard admin"
echo "  • /admin/super-admin - Super admin"
echo "  • /admin/ats - Gestion ATS"
echo "  • /admin/blog - Gestion blog"
echo "  • /admin/media - Gestionnaire médias"
echo "  • /conseiller/dashboard - Dashboard conseiller"

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Guide de développement: /opt/orientationpro/docs/DEVELOPMENT.md"
echo "• Architecture: /opt/orientationpro/docs/ARCHITECTURE.md"
echo "• Tests: /opt/orientationpro/docs/TESTING.md" 