#!/bin/bash

echo "🔍 Analyse des Routes et Pages Manquantes"
echo "=========================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Routes définies dans AppRouter.tsx
echo -e "${BLUE}📋 Routes définies dans AppRouter.tsx:${NC}"
routes=(
    "/"
    "/login"
    "/register"
    "/tests"
    "/tests/riasec"
    "/tests/emotional"
    "/tests/learning"
    "/tests/multiple"
    "/tests/career-transition"
    "/tests/no-diploma"
    "/tests/senior-employment"
    "/tests/entrepreneurial"
    "/ats"
    "/conseiller"
    "/recrutement"
    "/orientation-services"
    "/blog"
    "/blog/:slug"
    "/cv-optimizer"
    "/cv-history"
    "/unauthorized"
    "/guide-congo-2024"
    "/dashboard"
    "/test-results"
    "/profile"
    "/admin/dashboard"
    "/admin/super-admin"
    "/admin/ats"
    "/admin/blog"
    "/admin/media"
    "/conseiller/dashboard"
)

# Pages existantes
echo -e "${BLUE}📁 Pages existantes dans src/pages/:${NC}"
existing_pages=(
    "Index.tsx"
    "Login.tsx"
    "Register.tsx"
    "Tests.tsx"
    "RiasecTest.tsx"
    "EmotionalTest.tsx"
    "LearningTest.tsx"
    "MultipleIntelligenceTest.tsx"
    "CareerTransitionTest.tsx"
    "NoDiplomaTest.tsx"
    "SeniorEmploymentTest.tsx"
    "EntrepreneurialTest.tsx"
    "Recrutement.tsx"
    "Conseillers.tsx"
    "Blog.tsx"
    "BlogPost.tsx"
    "CVOptimizer.tsx"
    "CVHistory.tsx"
    "Unauthorized.tsx"
    "GuideEtudesCongo2024.tsx"
    "Dashboard.tsx"
    "TestResults.tsx"
    "Profile.tsx"
)

# Pages admin existantes
admin_pages=(
    "admin/Dashboard.tsx"
    "admin/SuperAdmin.tsx"
    "admin/ATSAdmin.tsx"
    "admin/BlogAdmin.tsx"
    "admin/MediaManager.tsx"
)

# Pages conseiller existantes
conseiller_pages=(
    "conseiller/Dashboard.tsx"
)

echo ""
echo -e "${YELLOW}📊 ANALYSE DES ROUTES:${NC}"
echo "================================"

# Vérifier les routes publiques
echo -e "${BLUE}🌐 Routes Publiques:${NC}"
public_routes=(
    "/"
    "/login"
    "/register"
    "/tests"
    "/tests/riasec"
    "/tests/emotional"
    "/tests/learning"
    "/tests/multiple"
    "/tests/career-transition"
    "/tests/no-diploma"
    "/tests/senior-employment"
    "/tests/entrepreneurial"
    "/ats"
    "/conseiller"
    "/recrutement"
    "/orientation-services"
    "/blog"
    "/blog/:slug"
    "/cv-optimizer"
    "/cv-history"
    "/unauthorized"
    "/guide-congo-2024"
)

for route in "${public_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g' | sed 's|:slug|slug|g')
    if [[ "$page_name" == "" ]]; then
        page_name="Index"
    fi
    
    # Vérifier si la page existe
    if [[ -f "src/pages/${page_name}.tsx" ]]; then
        echo -e "  ${GREEN}✅ $route → ${page_name}.tsx${NC}"
    else
        echo -e "  ${RED}❌ $route → ${page_name}.tsx (MANQUANT)${NC}"
    fi
done

echo ""
echo -e "${BLUE}🔒 Routes Protégées Utilisateur:${NC}"
user_routes=(
    "/dashboard"
    "/test-results"
    "/profile"
)

for route in "${user_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g')
    if [[ -f "src/pages/${page_name}.tsx" ]]; then
        echo -e "  ${GREEN}✅ $route → ${page_name}.tsx${NC}"
    else
        echo -e "  ${RED}❌ $route → ${page_name}.tsx (MANQUANT)${NC}"
    fi
done

echo ""
echo -e "${BLUE}👨‍💼 Routes Admin:${NC}"
admin_routes=(
    "/admin/dashboard"
    "/admin/super-admin"
    "/admin/ats"
    "/admin/blog"
    "/admin/media"
)

for route in "${admin_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g')
    if [[ -f "src/pages/${page_name}.tsx" ]]; then
        echo -e "  ${GREEN}✅ $route → ${page_name}.tsx${NC}"
    else
        echo -e "  ${RED}❌ $route → ${page_name}.tsx (MANQUANT)${NC}"
    fi
done

echo ""
echo -e "${BLUE}👨‍🏫 Routes Conseiller:${NC}"
conseiller_routes=(
    "/conseiller/dashboard"
)

for route in "${conseiller_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g')
    if [[ -f "src/pages/${page_name}.tsx" ]]; then
        echo -e "  ${GREEN}✅ $route → ${page_name}.tsx${NC}"
    else
        echo -e "  ${RED}❌ $route → ${page_name}.tsx (MANQUANT)${NC}"
    fi
done

echo ""
echo -e "${YELLOW}📈 RÉSUMÉ:${NC}"
echo "=========="

# Compter les routes
total_routes=$((${#public_routes[@]} + ${#user_routes[@]} + ${#admin_routes[@]} + ${#conseiller_routes[@]}))
echo -e "${BLUE}Total des routes définies: $total_routes${NC}"

# Identifier les pages manquantes
missing_pages=()

# Vérifier les pages publiques manquantes
for route in "${public_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g' | sed 's|:slug|slug|g')
    if [[ "$page_name" == "" ]]; then
        page_name="Index"
    fi
    
    if [[ ! -f "src/pages/${page_name}.tsx" ]]; then
        missing_pages+=("$page_name")
    fi
done

# Vérifier les pages utilisateur manquantes
for route in "${user_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g')
    if [[ ! -f "src/pages/${page_name}.tsx" ]]; then
        missing_pages+=("$page_name")
    fi
done

# Vérifier les pages admin manquantes
for route in "${admin_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g')
    if [[ ! -f "src/pages/${page_name}.tsx" ]]; then
        missing_pages+=("$page_name")
    fi
done

# Vérifier les pages conseiller manquantes
for route in "${conseiller_routes[@]}"; do
    page_name=$(echo "$route" | sed 's|^/||' | sed 's|/|_|g')
    if [[ ! -f "src/pages/${page_name}.tsx" ]]; then
        missing_pages+=("$page_name")
    fi
done

echo -e "${BLUE}Pages manquantes: ${#missing_pages[@]}${NC}"

if [[ ${#missing_pages[@]} -gt 0 ]]; then
    echo -e "${RED}📝 Pages à créer:${NC}"
    for page in "${missing_pages[@]}"; do
        echo -e "  • $page.tsx"
    done
else
    echo -e "${GREEN}✅ Toutes les pages sont présentes !${NC}"
fi

echo ""
echo -e "${YELLOW}🚀 Actions recommandées:${NC}"
echo "1. Créer les pages manquantes"
echo "2. Vérifier les imports dans AppRouter.tsx"
echo "3. Tester la navigation"
echo "4. Vérifier les permissions d'accès" 