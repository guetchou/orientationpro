import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, User, LogIn, LogOut, 
  Briefcase, Search, Book, School, BarChart 
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainNavItems: NavItem[] = [
    { name: 'Accueil', path: '/' },
    { name: 'Tests', path: '/tests', icon: <BarChart size={18} /> },
    { name: 'Établissements', path: '/establishments', icon: <School size={18} /> },
    { name: 'Ressources', path: '/resources', icon: <Book size={18} /> },
    { name: 'Contact', path: '/contact', icon: <Search size={18} /> },
  ];

  const authNavItems: NavItem[] = user ? [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Briefcase size={18} /> },
    { name: 'Profil', path: '/profile', icon: <User size={18} /> },
  ] : [
    { name: 'Connexion', path: '/login', icon: <LogIn size={18} /> },
    { name: 'Inscription', path: '/register', icon: <User size={18} /> },
  ];

  const handleLogout = () => {
    signOut();
    closeMenu();
  };

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md py-2' : 'bg-transparent py-4'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl text-primary">OrientationPro</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <ul className="flex space-x-1">
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth and Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center space-x-1">
            {authNavItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                asChild
                className={`${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : ''
                }`}
              >
                <Link to={item.path} className="flex items-center gap-1.5">
                  {item.icon}
                  {item.name}
                </Link>
              </Button>
            ))}
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1.5"
              >
                <LogOut size={18} />
                Déconnexion
              </Button>
            )}
          </div>
          
          <ModeToggle />
          
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <ul className="space-y-2">
              {mainNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {item.name}
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-gray-200 dark:border-gray-700 my-2"></li>
              {authNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {item.name}
                    </div>
                  </Link>
                </li>
              ))}
              {user && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={18} />
                      Déconnexion
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

// Export both as default and named export to fix import issues
export default Navbar;
export { Navbar };
