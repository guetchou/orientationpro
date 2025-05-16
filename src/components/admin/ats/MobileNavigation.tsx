
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', route: '/admin' },
    { id: 'candidates', label: 'Candidats', route: '/admin/ats' },
    { id: 'blog', label: 'Blog', route: '/admin/blog' },
    { id: 'cms', label: 'CMS', route: '/admin/cms' },
  ];

  return (
    <div className="md:hidden col-span-1 mb-4 overflow-x-auto">
      <div className="flex space-x-2 pb-2 w-full">
        {tabs.map((tab) => (
          <Button 
            key={tab.id}
            variant={tab.id === activeTab ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (tab.id === 'dashboard' || tab.id === 'blog' || tab.id === 'cms') {
                navigate(tab.route);
              } else {
                onTabChange(tab.id);
              }
            }}
            className={`whitespace-nowrap transition-all duration-300 ${
              tab.id === activeTab ? "relative" : ""
            }`}
          >
            {tab.id === activeTab && (
              <motion.span
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-md -z-10"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
