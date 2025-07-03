
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Image,
  Calendar,
  MessageSquare,
  Database
} from 'lucide-react';

export const AdminNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    {
      path: '/admin/super-admin',
      label: 'Tableau de bord',
      icon: BarChart3
    },
    {
      path: '/admin/ats',
      label: 'Système ATS',
      icon: Users
    },
    {
      path: '/admin/blog',
      label: 'Gestion Blog',
      icon: FileText
    },
    {
      path: '/admin/media',
      label: 'Gestionnaire Médias',
      icon: Image
    }
  ];

  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            asChild
            variant={isActive(item.path) ? 'default' : 'ghost'}
            size="sm"
          >
            <Link to={item.path} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
};
