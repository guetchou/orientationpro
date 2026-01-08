
import React from 'react';
import { NavItem } from './NavItem';

interface NavItemType {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface DesktopNavigationProps {
  items: NavItemType[];
  currentPath: string;
}

export const DesktopNavigation = ({ items, currentPath }: DesktopNavigationProps) => {
  return (
    <div className="hidden md:flex items-center space-x-1">
      <ul className="flex space-x-1">
        {items.map((item) => (
          <NavItem
            key={item.path}
            name={item.name}
            path={item.path}
            icon={item.icon}
            isActive={currentPath === item.path}
          />
        ))}
      </ul>
    </div>
  );
};
