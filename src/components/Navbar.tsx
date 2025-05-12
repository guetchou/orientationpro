
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Menu, X, User, LogIn, Briefcase, Search, Book, School, BarChart, Users } from 'lucide-react';
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
    { name: 'Conseillers', path: '/conseillers', icon: <Users size={18} /> },
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
            isActive={(path: string) => location.pathname === path}
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
