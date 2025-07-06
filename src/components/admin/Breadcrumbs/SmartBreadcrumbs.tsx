import React from 'react';
import { ChevronRight, Home, Users, FileText, Settings, BarChart3, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface SmartBreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  showHome?: boolean;
}

export const SmartBreadcrumbs: React.FC<SmartBreadcrumbsProps> = ({ 
  items, 
  onNavigate, 
  showHome = true 
}) => {
  const getIconForPath = (path: string) => {
    if (path.includes('dashboard') || path === '/') return <Home className="h-4 w-4" />;
    if (path.includes('users')) return <Users className="h-4 w-4" />;
    if (path.includes('content')) return <FileText className="h-4 w-4" />;
    if (path.includes('settings')) return <Settings className="h-4 w-4" />;
    if (path.includes('analytics')) return <BarChart3 className="h-4 w-4" />;
    if (path.includes('appointments')) return <Calendar className="h-4 w-4" />;
    if (path.includes('activity')) return <Activity className="h-4 w-4" />;
    return null;
  };

  const handleClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const breadcrumbItems = showHome 
    ? [{ label: 'Accueil', path: '/admin', icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  return (
    <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const icon = item.icon || getIconForPath(item.path);

        return (
          <React.Fragment key={item.path}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              
              <Button
                variant={isLast ? "default" : "ghost"}
                size="sm"
                className={`flex items-center space-x-1 h-8 px-2 ${
                  isLast 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleClick(item.path)}
                disabled={isLast}
              >
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span className="truncate max-w-32">{item.label}</span>
              </Button>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Composant pour afficher le contexte de navigation
export const NavigationContext: React.FC<{ 
  currentPath: string;
  onAction?: (action: string) => void;
}> = ({ currentPath, onAction }) => {
  const getContextInfo = (path: string) => {
    if (path.includes('dashboard')) {
      return {
        title: 'Tableau de bord',
        description: 'Vue d\'ensemble de la plateforme',
        actions: [
          { label: 'Nouvel utilisateur', action: 'new-user' },
          { label: 'Exporter données', action: 'export-data' },
          { label: 'Vérification système', action: 'system-check' }
        ]
      };
    }
    if (path.includes('users')) {
      return {
        title: 'Gestion des utilisateurs',
        description: 'Gérez les comptes et permissions',
        actions: [
          { label: 'Ajouter utilisateur', action: 'add-user' },
          { label: 'Importer liste', action: 'import-users' },
          { label: 'Exporter rapport', action: 'export-users' }
        ]
      };
    }
    if (path.includes('content')) {
      return {
        title: 'Gestion du contenu',
        description: 'Articles, ressources et événements',
        actions: [
          { label: 'Nouvel article', action: 'new-article' },
          { label: 'Gérer catégories', action: 'manage-categories' },
          { label: 'Planifier publication', action: 'schedule-publish' }
        ]
      };
    }
    if (path.includes('analytics')) {
      return {
        title: 'Analytics avancées',
        description: 'Statistiques et rapports détaillés',
        actions: [
          { label: 'Générer rapport', action: 'generate-report' },
          { label: 'Exporter données', action: 'export-analytics' },
          { label: 'Configurer alertes', action: 'configure-alerts' }
        ]
      };
    }
    if (path.includes('settings')) {
      return {
        title: 'Paramètres système',
        description: 'Configuration de la plateforme',
        actions: [
          { label: 'Sauvegarder', action: 'save-settings' },
          { label: 'Restaurer', action: 'restore-settings' },
          { label: 'Exporter config', action: 'export-config' }
        ]
      };
    }
    
    return {
      title: 'Navigation',
      description: 'Page en cours de développement',
      actions: []
    };
  };

  const context = getContextInfo(currentPath);

  const handleActionClick = (action: string) => {
    if (onAction) {
      onAction(action);
    } else {
      console.log(`Action: ${action}`);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{context.title}</h1>
          <p className="text-sm text-gray-600">{context.description}</p>
        </div>
        
        {context.actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {context.actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 