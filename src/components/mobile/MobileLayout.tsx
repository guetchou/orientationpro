import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Home, User, BookOpen, MessageCircle, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { OnlineStatus } from './OnlineStatus';
import { TouchGestures } from './TouchGestures';

interface MobileLayoutProps {
  children: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: BookOpen, label: 'Tests', path: '/tests' },
    { icon: User, label: 'Profil', path: '/profile' },
    { icon: MessageCircle, label: 'Conseillers', path: '/conseillers' },
    { icon: Settings, label: 'Paramètres', path: '/settings' }
  ];

  const handlePullToRefresh = () => {
    window.location.reload();
  };

  const handleSwipeLeft = () => {
    // Navigation vers la page suivante (logique personnalisée)
    console.log('Swipe left detected');
  };

  const handleSwipeRight = () => {
    // Navigation vers la page précédente
    window.history.back();
  };

  if (!isMobile) {
    return (
      <>
        {children}
        <PWAInstallPrompt />
        <OnlineStatus />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="text-xl font-bold text-blue-600">
              OrientationPro
            </Link>
          </div>
          
          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tests">
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Menu Mobile Slide-out */}
      <motion.div
        initial={false}
        animate={{ 
          x: isMobileMenuOpen ? 0 : -300,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 overflow-y-auto"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Contenu principal avec gestures */}
      <TouchGestures
        enablePullToRefresh={true}
        onPullToRefresh={handlePullToRefresh}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="pt-16 pb-20 min-h-screen"
      >
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </TouchGestures>

      {/* Navigation Bottom pour mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="flex items-center justify-around py-2">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center p-2 min-w-0 flex-1 transition-colors
                  ${isActive ? 'text-blue-600' : 'text-gray-600'}
                `}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Composants PWA et status */}
      <PWAInstallPrompt />
      <OnlineStatus />
    </div>
  );
};
