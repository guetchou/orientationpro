import React from 'react';
import { Link } from 'react-router-dom';

interface NavItemProps {
  name: string;
  path: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

export const NavItem = ({ name, path, icon, isActive, onClick }: NavItemProps) => {
  return (
    <li className="relative group">
      <Link
        to={path}
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1.5 relative ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'
        }`}
      >
        {icon && (
          <span className="transition-transform duration-300 group-hover:scale-110">
        {icon}
          </span>
        )}
        {name}
        
        {/* Effet de soulignement animé */}
        <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
          isActive 
            ? 'w-full bg-primary' 
            : 'w-0 bg-primary group-hover:w-full'
        }`} />
      </Link>
    </li>
  );
};
