#!/bin/bash

echo "🔧 Correction des Imports dans AppRouter.tsx"
echo "============================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Sauvegarder l'ancien fichier
cp src/router/AppRouter.tsx src/router/AppRouter.tsx.backup

echo -e "${BLUE}📝 Mise à jour des imports...${NC}"

# Créer le nouveau fichier AppRouter.tsx avec les bons imports
cat > src/router/AppRouter.tsx << 'EOF'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProfessionalHeader } from '@/components/layout/ProfessionalHeader';

// Pages publiques
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Tests from '@/pages/Tests';
import RiasecTest from '@/pages/RiasecTest';
import EmotionalTest from '@/pages/EmotionalTest';
import LearningTest from '@/pages/LearningTest';
import MultipleIntelligenceTest from '@/pages/MultipleIntelligenceTest';
import CareerTransitionTest from '@/pages/CareerTransitionTest';
import NoDiplomaTest from '@/pages/NoDiplomaTest';
import SeniorEmploymentTest from '@/pages/SeniorEmploymentTest';
import EntrepreneurialTest from '@/pages/EntrepreneurialTest';
import Recrutement from '@/pages/Recrutement';
import Conseillers from '@/pages/Conseillers';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import CVOptimizer from '@/pages/CVOptimizer';
import CVHistory from '@/pages/CVHistory';
import Unauthorized from '@/pages/Unauthorized';
import GuideEtudesCongo2024 from '@/pages/GuideEtudesCongo2024';

// Pages utilisateur
import Dashboard from '@/pages/Dashboard';
import TestResults from '@/pages/TestResults';
import Profile from '@/pages/Profile';

// Pages admin
import AdminDashboard from '@/pages/admin/Dashboard';
import SuperAdmin from '@/pages/admin/SuperAdmin';
import ATSAdmin from '@/pages/admin/ATSAdmin';
import BlogAdmin from '@/pages/admin/BlogAdmin';
import MediaManager from '@/pages/admin/MediaManager';

// Pages conseiller
import ConseillerDashboard from '@/pages/conseiller/Dashboard';

// Composants d'authentification
import { 
  PublicRoute, 
  PrivateRoute, 
  AdminRoute, 
  SuperAdminRoute, 
  ConseillerRoute, 
  UserRoute 
} from '@/components/auth/AuthGuard';

export const AppRouter = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <ProfessionalHeader />
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/riasec" element={<RiasecTest />} />
          <Route path="/tests/emotional" element={<EmotionalTest />} />
          <Route path="/tests/learning" element={<LearningTest />} />
          <Route path="/tests/multiple" element={<MultipleIntelligenceTest />} />
          <Route path="/tests/career-transition" element={<CareerTransitionTest />} />
          <Route path="/tests/no-diploma" element={<NoDiplomaTest />} />
          <Route path="/tests/senior-employment" element={<SeniorEmploymentTest />} />
          <Route path="/tests/entrepreneurial" element={<EntrepreneurialTest />} />
          <Route path="/ats" element={<Recrutement />} />
          <Route path="/conseiller" element={<Conseillers />} />
          <Route path="/recrutement" element={<Recrutement />} />
          <Route path="/orientation-services" element={<Tests />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cv-optimizer" element={<CVOptimizer />} />
          <Route path="/cv-history" element={<CVHistory />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/guide-congo-2024" element={<GuideEtudesCongo2024 />} />
          
          {/* Routes protégées utilisateur */}
          <Route path="/dashboard" element={
            <UserRoute>
              <Dashboard />
            </UserRoute>
          } />
          <Route path="/test-results" element={
            <UserRoute>
              <TestResults />
            </UserRoute>
          } />
          <Route path="/profile" element={
            <UserRoute>
              <Profile />
            </UserRoute>
          } />
          
          {/* Routes admin protégées */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/super-admin" element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          } />
          <Route path="/admin/ats" element={
            <AdminRoute>
              <ATSAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/blog" element={
            <AdminRoute>
              <BlogAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/media" element={
            <AdminRoute>
              <MediaManager />
            </AdminRoute>
          } />
          
          {/* Routes conseiller protégées */}
          <Route path="/conseiller/dashboard" element={
            <ConseillerRoute>
              <ConseillerDashboard />
            </ConseillerRoute>
          } />
          
          {/* Redirection pour toutes les autres routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};
EOF

echo -e "${GREEN}✅ AppRouter.tsx mis à jour${NC}"

# Vérifier que le fichier a été créé correctement
if [[ -f "src/router/AppRouter.tsx" ]]; then
    echo -e "${GREEN}✅ Fichier AppRouter.tsx créé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création du fichier${NC}"
    exit 1
fi

# Compiler pour vérifier les erreurs
echo -e "${BLUE}🔍 Vérification de la compilation...${NC}"
cd frontend && npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Compilation réussie${NC}"
else
    echo -e "${YELLOW}⚠️ Erreurs de compilation détectées${NC}"
    echo -e "${BLUE}🔧 Correction des erreurs...${NC}"
    
    # Afficher les erreurs de compilation
    npm run build 2>&1 | head -20
fi

echo ""
echo -e "${GREEN}🎉 Mise à jour des imports terminée !${NC}"
echo ""
echo -e "${YELLOW}📋 Routes disponibles:${NC}"
echo "🌐 Routes Publiques:"
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
echo "🔒 Routes Protégées:"
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