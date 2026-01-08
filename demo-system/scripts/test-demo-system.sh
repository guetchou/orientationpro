#!/bin/bash

echo "🧪 Test du Système DEMO"
echo "======================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://localhost:8045"
BACKEND_URL="http://localhost:7474"
DEMO_SYSTEM="/opt/orientationpro/demo-system"

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

# Fonction pour tester une API
test_api() {
    local endpoint=$1
    local description=$2
    local demo_header=$3
    
    echo -e "${BLUE}🔍 Test API $endpoint ($description)...${NC}"
    
    headers=""
    if [ "$demo_header" = "true" ]; then
        headers="-H 'X-Demo-Mode: true'"
    fi
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $headers "$BACKEND_URL$endpoint")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "  ${GREEN}✅ $endpoint - HTTP $response${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $endpoint - HTTP $response${NC}"
        return 1
    fi
}

echo -e "${YELLOW}🚀 Démarrage des tests du système DEMO...${NC}"
echo ""

# 1. Test de l'activation du mode DEMO
echo -e "${YELLOW}📋 Test 1: Activation du mode DEMO${NC}"
echo "=================================="

# Activer le mode DEMO
cd $DEMO_SYSTEM/scripts
./activate-demo.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mode DEMO activé${NC}"
else
    echo -e "${RED}❌ Erreur activation mode DEMO${NC}"
    exit 1
fi

echo ""

# 2. Test des routes frontend en mode DEMO
echo -e "${YELLOW}📋 Test 2: Routes frontend en mode DEMO${NC}"
echo "=============================================="

# Vérifier que le serveur frontend est accessible
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Serveur frontend accessible${NC}"
else
    echo -e "${RED}❌ Serveur frontend non accessible${NC}"
    echo -e "${YELLOW}💡 Démarrez le serveur: cd frontend && npm run dev${NC}"
    exit 1
fi

# Routes à tester en mode DEMO
demo_routes=(
    "/:Accueil DEMO:200"
    "/login:Connexion DEMO:200"
    "/tests:Tests DEMO:200"
    "/tests/riasec:Test RIASEC DEMO:200"
    "/dashboard:Dashboard DEMO:200"
    "/admin/dashboard:Admin DEMO:200"
)

success_count=0
total_count=0

for route_info in "${demo_routes[@]}"; do
    IFS=':' read -r route description expected_status <<< "$route_info"
    total_count=$((total_count + 1))
    
    if test_route "$route" "$description" "$expected_status"; then
        success_count=$((success_count + 1))
    fi
    echo ""
done

echo ""

# 3. Test des APIs backend en mode DEMO
echo -e "${YELLOW}📋 Test 3: APIs backend en mode DEMO${NC}"
echo "=========================================="

# APIs à tester
demo_apis=(
    "/api/demo/status:Statut DEMO:true"
    "/api/demo/data:Données DEMO:true"
    "/api/auth/login:Connexion:false"
    "/api/tests:Tests:false"
)

for api_info in "${demo_apis[@]}"; do
    IFS=':' read -r endpoint description demo_header <<< "$api_info"
    total_count=$((total_count + 1))
    
    if test_api "$endpoint" "$description" "$demo_header"; then
        success_count=$((success_count + 1))
    fi
    echo ""
done

echo ""

# 4. Test de l'isolation des données
echo -e "${YELLOW}📋 Test 4: Isolation des données${NC}"
echo "================================"

# Test d'écriture en mode DEMO
echo -e "${BLUE}🔍 Test d'écriture en mode DEMO...${NC}"
write_response=$(curl -s -X POST -H "Content-Type: application/json" -H "X-Demo-Mode: true" \
  -d '{"test": "data"}' "$BACKEND_URL/api/demo/test-write")

if echo "$write_response" | grep -q "demo_mode.*true"; then
    echo -e "  ${GREEN}✅ Écriture simulée en mode DEMO${NC}"
    success_count=$((success_count + 1))
else
    echo -e "  ${RED}❌ Écriture non simulée en mode DEMO${NC}"
fi
total_count=$((total_count + 1))

echo ""

# 5. Test de la base de données DEMO
echo -e "${YELLOW}📋 Test 5: Base de données DEMO${NC}"
echo "================================="

# Vérifier que le schéma DEMO existe
schema_check=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'demo';")

if [ -n "$schema_check" ]; then
    echo -e "${GREEN}✅ Schéma DEMO existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Schéma DEMO n'existe pas${NC}"
fi
total_count=$((total_count + 1))

# Vérifier les données de démonstration
demo_users=$(psql -h localhost -U postgres -d orientationpro -t -c "SELECT COUNT(*) FROM demo.users;")

if [ "$demo_users" -gt 0 ]; then
    echo -e "${GREEN}✅ Données de démonstration présentes ($demo_users utilisateurs)${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Aucune donnée de démonstration${NC}"
fi
total_count=$((total_count + 1))

echo ""

# 6. Test des composants frontend
echo -e "${YELLOW}📋 Test 6: Composants frontend DEMO${NC}"
echo "=========================================="

# Vérifier que les composants DEMO existent
if [ -f "$DEMO_SYSTEM/frontend/components/DemoOverlay.tsx" ]; then
    echo -e "${GREEN}✅ Composant DemoOverlay existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Composant DemoOverlay manquant${NC}"
fi
total_count=$((total_count + 1))

if [ -f "$DEMO_SYSTEM/frontend/hooks/useDemoMode.ts" ]; then
    echo -e "${GREEN}✅ Hook useDemoMode existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Hook useDemoMode manquant${NC}"
fi
total_count=$((total_count + 1))

if [ -f "$DEMO_SYSTEM/frontend/components/DemoDashboard.tsx" ]; then
    echo -e "${GREEN}✅ Composant DemoDashboard existe${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ Composant DemoDashboard manquant${NC}"
fi
total_count=$((total_count + 1))

echo ""

# 7. Test des scripts de gestion
echo -e "${YELLOW}📋 Test 7: Scripts de gestion${NC}"
echo "================================"

# Vérifier que les scripts existent et sont exécutables
scripts=("activate-demo.sh" "deactivate-demo.sh" "reset-demo.sh" "backup-demo.sh")

for script in "${scripts[@]}"; do
    if [ -x "$DEMO_SYSTEM/scripts/$script" ]; then
        echo -e "${GREEN}✅ Script $script existe et est exécutable${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌ Script $script manquant ou non exécutable${NC}"
    fi
    total_count=$((total_count + 1))
done

echo ""

# 8. Test de la documentation
echo -e "${YELLOW}📋 Test 8: Documentation${NC}"
echo "========================"

# Vérifier que la documentation existe
docs=("README.md" "ADMIN.md" "USER.md" "TECHNICAL.md")

for doc in "${docs[@]}"; do
    if [ -f "$DEMO_SYSTEM/docs/$doc" ]; then
        echo -e "${GREEN}✅ Documentation $doc existe${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌ Documentation $doc manquante${NC}"
    fi
    total_count=$((total_count + 1))
done

echo ""
echo -e "${YELLOW}📊 Résumé des Tests:${NC}"
echo "========================"
echo -e "${BLUE}Total des tests: $total_count${NC}"
echo -e "${GREEN}Tests réussis: $success_count${NC}"
echo -e "${RED}Tests échoués: $((total_count - success_count))${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 Tous les tests du système DEMO sont réussis !${NC}"
else
    echo -e "${YELLOW}⚠️ Certains tests nécessitent une attention${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "1. Vérifier les tests échoués"
echo "2. Corriger les problèmes identifiés"
echo "3. Relancer les tests"
echo "4. Déployer en production"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Guide complet: $DEMO_SYSTEM/docs/README.md"
echo "• Guide admin: $DEMO_SYSTEM/docs/ADMIN.md"
echo "• Guide utilisateur: $DEMO_SYSTEM/docs/USER.md"
