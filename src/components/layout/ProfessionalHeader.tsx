import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  Users,
  FileText,
  Shield,
  Home,
  Search,
  Sparkles,
  Lightbulb,
  BookOpen,
  Target
} from 'lucide-react';

export const ProfessionalHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Vérifier si l'utilisateur est admin
  const adminToken = localStorage.getItem('adminToken');
  const isAdmin = adminToken || (user && (user as any).is_admin);

  const handleLogout = async () => {
    try {
      console.log('🔐 Déconnexion depuis ProfessionalHeader...');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer le nettoyage même en cas d'erreur
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const navItems = [
    { name: 'Accueil', path: '/', icon: Home, protected: false, highlight: false },
            { name: 'Tests RIASEC', path: '/tests', icon: Search, protected: false, highlight: true },
        { name: 'Boost ATS', path: '/ats', icon: Sparkles, protected: false, highlight: true },
        { name: 'Conseiller Pro', path: '/conseiller', icon: Lightbulb, protected: false, highlight: true },
    { name: 'Blog', path: '/blog', icon: BookOpen, protected: false, highlight: false },
  ];

  const adminItems = [
    { name: 'Super Admin', path: '/admin/super-admin', icon: Shield },
    { name: 'Système ATS', path: '/admin/ats', icon: Users },
    { name: 'Gestion Blog', path: '/admin/blog', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/95 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Orientation Pro Congo
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.protected && !user) return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : item.highlight
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium">
                      {user.email?.split('@')[0] || 'Utilisateur'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Menu Admin - seulement pour les admins */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Administration
                      </div>
                      {adminItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.path} asChild>
                            <Link to={item.path} className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <Link to="/register">Essai gratuit</Link>
                </Button>
              </div>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                if (item.protected && !user) return null;
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : item.highlight
                        ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Actions utilisateur mobile */}
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-4 space-y-2">
                    <Button variant="ghost" asChild className="w-full justify-start text-gray-600">
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Briefcase className="h-5 w-5 mr-3" />
                        Tableau de bord
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start text-gray-600">
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="h-5 w-5 mr-3" />
                        Paramètres
                      </Link>
                    </Button>
                    
                    {/* Menu Admin Mobile - seulement pour les admins */}
              {isAdmin && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                            <Button key={item.path} variant="ghost" asChild className="w-full justify-start text-gray-600">
                              <Link to={item.path} onClick={() => setIsMenuOpen(false)}>
                                <Icon className="h-5 w-5 mr-3" />
                                {item.name}
                      </Link>
                            </Button>
                    );
                  })}
                </>
              )}

                    <Button variant="ghost" asChild className="w-full justify-start text-red-600" onClick={handleLogout}>
                      <div className="flex items-center">
                        <LogOut className="h-5 w-5 mr-3" />
                        Déconnexion
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-4 space-y-2">
                    <Button variant="ghost" asChild className="w-full justify-start text-gray-600">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Se connecter
                      </Link>
                    </Button>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        Essai gratuit
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
