
import React from 'react';
import { NavItem } from './NavItem';
import { LogOut } from 'lucide-react';

interface NavItemType {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface MobileNavigationProps {
  isOpen: boolean;
  mainNavItems: NavItemType[];
  authNavItems: NavItemType[];
  currentPath: string;
  user: any;
  onLogout: () => void;
  onClose: () => void;
}

export const MobileNavigation = ({
  isOpen,
  mainNavItems,
  authNavItems,
  currentPath,
  user,
  onLogout,
  onClose
}: MobileNavigationProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white dark:bg-slate-900 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <ul className="space-y-2">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.path}
              name={item.name}
              path={item.path}
              icon={item.icon}
              isActive={currentPath === item.path}
              onClick={onClose}
            />
          ))}
          <li className="border-t border-gray-200 dark:border-gray-700 my-2"></li>
          {authNavItems.map((item) => (
            <NavItem
              key={item.path}
              name={item.name}
              path={item.path}
              icon={item.icon}
              isActive={currentPath === item.path}
              onClick={onClose}
            />
          ))}
          {user && (
            <li>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
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
  );
};
