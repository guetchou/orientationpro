import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  BarChart3, 
  ChevronDown,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AuthNavItemProps {
  name: string;
  path: string;
  icon?: React.ReactNode;
  isActive: boolean;
}

interface AuthNavItemsProps {
  items: AuthNavItemProps[];
  user: any;
  onLogout: () => void;
  closeMenu?: () => void;
  isMobile?: boolean;
}

export const AuthNavItems = ({ 
  items, 
  user, 
  onLogout, 
  closeMenu, 
  isMobile = false
}: AuthNavItemsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    if (closeMenu) closeMenu();
    setIsDropdownOpen(false);
  };

  // Simuler des données d'engagement (à remplacer par de vraies données)
  const hasNewResults = true;
  const hasUnreadMessages = false;
  const activeTests = 2;

  if (isMobile) {
    return (
      <>
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                item.isActive
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
      </>
    );
  }

  // Menu utilisateur avancé pour desktop
  if (user) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="text-xs">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* Indicateurs d'engagement */}
          <div className="flex items-center gap-1">
            {hasNewResults && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            {hasUnreadMessages && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            {!hasNewResults && !hasUnreadMessages && (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </div>
          
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              {/* Badges d'engagement */}
              <div className="flex items-center justify-between mb-3 px-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {activeTests} tests actifs
                </Badge>
                {hasNewResults && (
                  <Badge variant="destructive" className="animate-pulse">
                    Nouveaux résultats
                  </Badge>
                )}
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <BarChart3 size={16} />
                  Tableau de bord
                </Link>
                
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <User size={16} />
                  Mon profil
                </Link>
                
                <Link
                  to="/test-results"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Clock size={16} />
                  Mes résultats
                  {hasNewResults && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-auto" />
                  )}
                </Link>
                
                <Link
                  to="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Settings size={16} />
                  Paramètres
                </Link>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors w-full"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Menu simple pour utilisateurs non connectés
  return (
    <div className="flex items-center space-x-1">
      {items.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          size="sm"
          asChild
          className={`${
            item.isActive
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
    </div>
  );
};
