#!/bin/bash

echo "🚀 Création des Pages Manquantes"
echo "================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction pour créer une page de base
create_page() {
    local page_name=$1
    local route_path=$2
    local component_name=$3
    
    echo -e "${BLUE}📝 Création de $page_name.tsx...${NC}"
    
    cat > "src/pages/$page_name.tsx" << EOF
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Home, 
  BookOpen, 
  Users, 
  Briefcase,
  FileText,
  Settings,
  User,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

const $component_name: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft size={20} />
                <span>Retour à l'accueil</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Orientation Pro Congo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              $component_name
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Page en cours de développement pour $route_path
            </p>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Fonctionnalités</span>
                </CardTitle>
                <CardDescription>
                  Découvrez les fonctionnalités disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Interface moderne</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Navigation intuitive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Design responsive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Support</span>
                </CardTitle>
                <CardDescription>
                  Besoin d'aide ? Contactez-nous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">support@orientationpro.cg</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm">+242 06 123 456</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Brazzaville, Congo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Statistiques</span>
                </CardTitle>
                <CardDescription>
                  Données et métriques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilisateurs actifs</span>
                    <Badge variant="secondary">1,234</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tests complétés</span>
                    <Badge variant="secondary">5,678</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Satisfaction</span>
                    <Badge variant="secondary">98%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/tests">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Découvrir les tests
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/conseiller">
                  <Users className="h-4 w-4 mr-2" />
                  Nos conseillers
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Page en cours de développement - Mise à jour prévue bientôt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default $component_name;
EOF

    echo -e "${GREEN}✅ $page_name.tsx créé${NC}"
}

# Pages manquantes avec leurs correspondances
declare -A missing_pages=(
    ["login"]="Login"
    ["register"]="Register"
    ["tests"]="Tests"
    ["tests_riasec"]="RiasecTest"
    ["tests_emotional"]="EmotionalTest"
    ["tests_learning"]="LearningTest"
    ["tests_multiple"]="MultipleIntelligenceTest"
    ["tests_career-transition"]="CareerTransitionTest"
    ["tests_no-diploma"]="NoDiplomaTest"
    ["tests_senior-employment"]="SeniorEmploymentTest"
    ["tests_entrepreneurial"]="EntrepreneurialTest"
    ["ats"]="Recrutement"
    ["conseiller"]="Conseillers"
    ["recrutement"]="Recrutement"
    ["orientation-services"]="Tests"
    ["blog"]="Blog"
    ["blog_slug"]="BlogPost"
    ["cv-optimizer"]="CVOptimizer"
    ["cv-history"]="CVHistory"
    ["unauthorized"]="Unauthorized"
    ["guide-congo-2024"]="GuideEtudesCongo2024"
    ["dashboard"]="Dashboard"
    ["test-results"]="TestResults"
    ["profile"]="Profile"
    ["admin_dashboard"]="AdminDashboard"
    ["admin_super-admin"]="SuperAdmin"
    ["admin_ats"]="ATSAdmin"
    ["admin_blog"]="BlogAdmin"
    ["admin_media"]="MediaManager"
    ["conseiller_dashboard"]="ConseillerDashboard"
)

# Créer les pages manquantes
echo -e "${YELLOW}🚀 Création des pages manquantes...${NC}"
echo ""

for page_name in "${!missing_pages[@]}"; do
    component_name="${missing_pages[$page_name]}"
    route_path="/$page_name"
    
    # Vérifier si la page existe déjà
    if [[ -f "src/pages/$page_name.tsx" ]]; then
        echo -e "${GREEN}✅ $page_name.tsx existe déjà${NC}"
    else
        create_page "$page_name" "$route_path" "$component_name"
    fi
done

echo ""
echo -e "${GREEN}🎉 Création des pages terminée !${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "1. Vérifier les imports dans AppRouter.tsx"
echo "2. Tester la navigation"
echo "3. Personnaliser le contenu des pages"
echo "4. Ajouter les fonctionnalités spécifiques"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Guide de développement: /opt/orientationpro/docs/DEVELOPMENT.md"
echo "• Architecture: /opt/orientationpro/docs/ARCHITECTURE.md" 