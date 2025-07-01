
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Upload 
} from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'candidates', label: 'Candidats', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'reports', label: 'Rapports', icon: TrendingUp }
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
