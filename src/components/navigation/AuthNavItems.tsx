
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

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
  const handleLogout = () => {
    onLogout();
    if (closeMenu) closeMenu();
  };

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
  );
};
