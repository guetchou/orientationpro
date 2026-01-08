import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Menu, X, User, LogIn, Briefcase, Search, Book, School, BarChart, Users, Info, Compass } from 'lucide-react';
import { NavLogo } from './navigation/NavLogo';
import { DesktopNavigation } from './navigation/DesktopNavigation';
import { AuthNavItems } from './navigation/AuthNavItems';
import { MobileNavigation } from './navigation/MobileNavigation';
import { getNavbarStyles } from './navigation/NavbarStyles';

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
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainNavItems: NavItem[] = [
    { name: 'Accueil', path: '/' },
    { name: 'Tests', path: '/tests', icon: <BarChart size={18} /> },
    { name: 'Orientation', path: '/orientation-services', icon: <Compass size={18} /> },
    { name: 'Conseillers', path: '/conseiller', icon: <Users size={18} /> },
    { name: 'Recrutement', path: '/recrutement', icon: <Briefcase size={18} /> },
    { name: 'Ressources', path: '/tests', icon: <Book size={18} /> },
    { name: 'À Propos', path: '/', icon: <Info size={18} /> },
    { name: 'Contact', path: '/', icon: <Search size={18} /> },
    { name: 'Guide 2024', path: '/guide-congo-2024', icon: <School size={18} /> },
  ];

  // Ajouter la propriété isActive pour chaque élément
  const authNavItems = user ? [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Briefcase size={18} />, isActive: location.pathname === '/dashboard' },
    { name: 'Profil', path: '/profile', icon: <User size={18} />, isActive: location.pathname === '/profile' },
  ] : [
    { name: 'Connexion', path: '/login', icon: <LogIn size={18} />, isActive: location.pathname === '/login' },
    { name: 'Inscription', path: '/register', icon: <User size={18} />, isActive: location.pathname === '/register' },
  ];

  const styles = getNavbarStyles(scrolled);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <NavLogo />

        {/* Desktop Navigation */}
        <DesktopNavigation 
          items={mainNavItems} 
          currentPath={location.pathname} 
        />

        {/* Auth and Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <AuthNavItems 
            items={authNavItems}
            user={user}
            onLogout={signOut}
          />
          
          <ModeToggle />
          
          <button
            onClick={toggleMenu}
            className={styles.mobileMenuButton}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isOpen}
        mainNavItems={mainNavItems}
        authNavItems={authNavItems}
        currentPath={location.pathname}
        user={user}
        onLogout={signOut}
        onClose={closeMenu}
      />
    </nav>
  );
};

// Export both as default and named export to fix import issues
export default Navbar;
export { Navbar };
