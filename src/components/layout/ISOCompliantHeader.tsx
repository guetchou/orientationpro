import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Briefcase,
  Home,
  Search,
  Brain,
  Target,
  Users,
  BookOpen,
  Shield,
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Header conforme aux normes ISO 9241
 * - ISO 9241-11: Utilisabilité (effectiveness, efficiency, satisfaction)
 * - ISO 9241-12: Organisation et présentation de l'information
 * - ISO 9241-13: Guidage de l'utilisateur
 * - ISO 9241-210:2019: Conception centrée utilisateur
 */
export const ISOCompliantHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Vérifier si l'utilisateur est admin
  const adminToken = localStorage.getItem('adminToken');
  const isAdmin = adminToken || (user && (user as any).is_admin);

  // Gestion du scroll pour l'accessibilité (ISO 9241-11)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gestion du focus pour l'accessibilité (ISO 9241-11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  // Architecture de l'information selon ISO 9241-12
  // Hiérarchie claire et logique des informations
  const primaryNavigation = [
    { 
      name: 'Accueil', 
      path: '/', 
      icon: Home, 
      description: 'Retour à la page d\'accueil',
      ariaLabel: 'Aller à la page d\'accueil'
    },
    { 
      name: 'Tests d\'Orientation', 
      path: '/tests', 
      icon: Brain, 
      description: 'Découvrez votre profil professionnel',
      ariaLabel: 'Accéder aux tests d\'orientation professionnelle',
      badge: 'Populaire'
    },
    { 
      name: 'Emploi', 
      path: '/recruitment', 
      icon: Briefcase, 
      description: 'Consultez les offres d\'emploi',
      ariaLabel: 'Voir les offres d\'emploi disponibles'
    },
    { 
      name: 'CV Optimizer', 
      path: '/cv-optimizer', 
      icon: Target, 
      description: 'Optimisez votre CV avec l\'IA',
      ariaLabel: 'Optimiser votre CV avec l\'intelligence artificielle'
    }
  ];

  const secondaryNavigation = [
    { 
      name: 'Conseillers', 
      path: '/book-appointment', 
      icon: Users, 
      description: 'Prenez rendez-vous avec un conseiller',
      ariaLabel: 'Réserver un rendez-vous avec un conseiller professionnel'
    },
    { 
      name: 'Ressources', 
      path: '/guide-congo-2024', 
      icon: BookOpen, 
      description: 'Guide des études au Congo',
      ariaLabel: 'Consulter le guide des études au Congo'
    }
  ];

  const adminNavigation = [
    { name: 'Administration', path: '/admin/super-admin', icon: Shield, description: 'Panneau d\'administration' },
    { name: 'Système ATS', path: '/admin/ats', icon: Brain, description: 'Gestion du système ATS' },
    { name: 'Gestion Blog', path: '/admin/blog', icon: BookOpen, description: 'Gestion du blog' }
  ];

  // Fonction d'aide pour l'accessibilité (ISO 9241-11)
  const handleKeyNavigation = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200' 
          : 'bg-white shadow-sm border-b border-gray-100'
      }`}
      role="banner"
      aria-label="Navigation principale"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Conforme ISO 9241-12 (identification claire) */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
            aria-label="Orientation Pro Congo - Retour à l'accueil"
          >
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900">
                Orientation Pro
              </span>
              <p className="text-xs text-gray-500 -mt-1">Congo</p>
            </div>
          </Link>

          {/* Navigation principale - ISO 9241-12 (organisation logique) */}
          <nav 
            className="hidden lg:flex items-center space-x-1"
            role="navigation"
            aria-label="Navigation principale"
          >
            {primaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  onKeyDown={(e) => handleKeyNavigation(e, item.path)}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge 
                      className="ml-1 text-xs bg-orange-100 text-orange-700 border-orange-200"
                      aria-label={`${item.name} est populaire`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  
                  {/* Tooltip informatif - ISO 9241-13 (guidage utilisateur) */}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                    role="tooltip"
                    aria-hidden="true"
                  >
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {item.description}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Actions utilisateur - ISO 9241-12 (regroupement logique) */}
          <div className="flex items-center space-x-3">
            {/* Notifications - Accessible selon WCAG 2.1 */}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Notifications (3 nouvelles)"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">3 nouvelles notifications</span>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>

            {/* Menu utilisateur */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={`Menu utilisateur pour ${user.email?.split('@')[0] || 'utilisateur'}`}
                  >
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                      {user.email?.split('@')[0] || 'Utilisateur'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 p-2"
                  role="menu"
                  aria-label="Menu utilisateur"
                >
                  {/* Informations utilisateur */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-semibold text-sm text-gray-900">
                      {user.email?.split('@')[0] || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  {/* Navigation secondaire */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Navigation
                    </p>
                    {secondaryNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem 
                          key={item.path} 
                          asChild
                          role="menuitem"
                        >
                          <Link 
                            to={item.path} 
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={item.ariaLabel}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>

                  {/* Menu administration */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Administration
                        </p>
                        {adminNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <DropdownMenuItem key={item.path} asChild role="menuitem">
                              <Link 
                                to={item.path} 
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label={item.description}
                              >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                <span>{item.name}</span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-600 p-2 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    role="menuitem"
                    aria-label="Se déconnecter"
                  >
                    <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Actions pour utilisateurs non connectés */
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  asChild 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Link to="/login" aria-label="Se connecter à votre compte">
                    Se connecter
                  </Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Link to="/register" aria-label="Créer un compte gratuit">
                    <ArrowRight className="h-4 w-4 mr-2" aria-hidden="true" />
                    Essai gratuit
                  </Link>
                </Button>
              </div>
            )}

            {/* Menu mobile - Accessible selon WCAG 2.1 */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu mobile - ISO 9241-13 (guidage utilisateur) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-white shadow-lg"
              role="navigation"
              aria-label="Menu mobile"
            >
              <div className="px-2 pt-4 pb-6 space-y-1">
                {/* Navigation principale mobile */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                    Navigation principale
                  </p>
                  {primaryNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between p-4 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                        aria-label={item.ariaLabel}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>

                {/* Navigation secondaire mobile */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                    Services
                  </p>
                  {secondaryNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 p-4 rounded-lg text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label={item.ariaLabel}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Actions utilisateur mobile */}
                {user ? (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start text-gray-600 p-4 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} aria-label="Accéder au tableau de bord">
                        <Briefcase className="h-5 w-5 mr-3" aria-hidden="true" />
                        Tableau de bord
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start text-gray-600 p-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} aria-label="Gérer mon profil">
                        <Settings className="h-5 w-5 mr-3" aria-hidden="true" />
                        Paramètres
                      </Link>
                    </Button>
                    
                    {isAdmin && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Administration
                        </div>
                        {adminNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Button 
                              key={item.path} 
                              variant="ghost" 
                              asChild 
                              className="w-full justify-start text-gray-600 p-4 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              <Link 
                                to={item.path} 
                                onClick={() => setIsMenuOpen(false)}
                                aria-label={item.description}
                              >
                                <Icon className="h-5 w-5 mr-3" aria-hidden="true" />
                                {item.name}
                              </Link>
                            </Button>
                          );
                        })}
                      </>
                    )}

                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start text-red-600 p-4 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                      onClick={handleLogout}
                    >
                      <div className="flex items-center" aria-label="Se déconnecter">
                        <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
                        Déconnexion
                      </div>
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start text-gray-600 p-4 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Link to="/login" onClick={() => setIsMenuOpen(false)} aria-label="Se connecter à votre compte">
                        Se connecter
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Link to="/register" onClick={() => setIsMenuOpen(false)} aria-label="Créer un compte gratuit">
                        <ArrowRight className="h-4 w-4 mr-2" aria-hidden="true" />
                        Essai gratuit
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Aide et support - ISO 9241-13 */}
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full justify-start text-gray-600 p-4 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <Link to="/help" onClick={() => setIsMenuOpen(false)} aria-label="Obtenir de l'aide">
                      <HelpCircle className="h-5 w-5 mr-3" aria-hidden="true" />
                      Aide et Support
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
