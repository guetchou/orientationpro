
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
    <li>
      <Link
        to={path}
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        {icon}
        {name}
      </Link>
    </li>
  );
};
