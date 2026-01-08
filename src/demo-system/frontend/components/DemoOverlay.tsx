import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Info, 
  Shield, 
  Database,
  Users,
  Activity
} from 'lucide-react';
import { useDemoMode } from '../hooks/useDemoMode';

interface DemoOverlayProps {
  children: React.ReactNode;
}

export const DemoOverlay: React.FC<DemoOverlayProps> = ({ children }) => {
  const { isDemoMode, demoData, toggleDemoMode } = useDemoMode();
  const [isVisible, setIsVisible] = useState(true);

  if (!isDemoMode) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Overlay DEMO */}
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Database className="h-5 w-5" />
              <span className="font-bold">MODE DÉMONSTRATION</span>
              <Badge variant="secondary" className="bg-white text-blue-600">
                {demoData?.userCount || 0} utilisateurs
              </Badge>
              <Badge variant="secondary" className="bg-white text-purple-600">
                {demoData?.testCount || 0} tests
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsVisible(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Masquer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleDemoMode}
                className="bg-red-600/20 border-red-400/30 text-white hover:bg-red-600/30"
              >
                <Shield className="h-4 w-4 mr-1" />
                Quitter DEMO
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur flottant */}
      {!isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVisible(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            Afficher DEMO
          </Button>
        </div>
      )}

      {/* Contenu principal avec overlay */}
      <div className={isDemoMode ? 'opacity-90' : ''}>
        {children}
      </div>

      {/* Badges DEMO sur les éléments interactifs */}
      {isDemoMode && (
        <div className="fixed bottom-4 left-4 z-40">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Mode démonstration actif - Aucune donnée réelle modifiée
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default DemoOverlay;
