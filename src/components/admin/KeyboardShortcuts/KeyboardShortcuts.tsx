import React, { useEffect, useState } from 'react';
import { Command, X, Keyboard, Search, Bell, Users, FileText, Settings, Calendar, Plus, Download, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Shortcut {
  key: string;
  description: string;
  category: 'navigation' | 'actions' | 'search' | 'system';
  icon: React.ReactNode;
  action?: () => void;
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'navigation' | 'actions' | 'search' | 'system'>('navigation');

  const shortcuts: Shortcut[] = [
    // Navigation
    {
      key: '⌘ + K',
      description: 'Recherche globale',
      category: 'search',
      icon: <Search className="h-4 w-4" />
    },
    {
      key: '⌘ + N',
      description: 'Nouvel utilisateur',
      category: 'actions',
      icon: <Users className="h-4 w-4" />
    },
    {
      key: '⌘ + T',
      description: 'Nouveau test',
      category: 'actions',
      icon: <FileText className="h-4 w-4" />
    },
    {
      key: '⌘ + A',
      description: 'Nouveau rendez-vous',
      category: 'actions',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      key: '⌘ + D',
      description: 'Dashboard',
      category: 'navigation',
      icon: <Activity className="h-4 w-4" />
    },
    {
      key: '⌘ + U',
      description: 'Utilisateurs',
      category: 'navigation',
      icon: <Users className="h-4 w-4" />
    },
    {
      key: '⌘ + C',
      description: 'Contenu',
      category: 'navigation',
      icon: <FileText className="h-4 w-4" />
    },
    {
      key: '⌘ + S',
      description: 'Paramètres',
      category: 'navigation',
      icon: <Settings className="h-4 w-4" />
    },
    {
      key: '⌘ + E',
      description: 'Exporter données',
      category: 'actions',
      icon: <Download className="h-4 w-4" />
    },
    {
      key: '⌘ + B',
      description: 'Notifications',
      category: 'search',
      icon: <Bell className="h-4 w-4" />
    },
    {
      key: '⌘ + /',
      description: 'Aide (ce menu)',
      category: 'system',
      icon: <Keyboard className="h-4 w-4" />
    },
    {
      key: '⌘ + M',
      description: 'Mode sombre/clair',
      category: 'system',
      icon: <Settings className="h-4 w-4" />
    }
  ];

  const categories = [
    { id: 'navigation', label: 'Navigation', icon: <Activity className="h-4 w-4" /> },
    { id: 'actions', label: 'Actions', icon: <Plus className="h-4 w-4" /> },
    { id: 'search', label: 'Recherche', icon: <Search className="h-4 w-4" /> },
    { id: 'system', label: 'Système', icon: <Settings className="h-4 w-4" /> }
  ];

  const filteredShortcuts = shortcuts.filter(s => s.category === activeCategory);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Fermer avec Échap
      if (e.key === 'Escape') {
        onClose();
      }

      // Raccourcis spécifiques
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            console.log('Recherche globale');
            onClose();
            break;
          case 'n':
            e.preventDefault();
            console.log('Nouvel utilisateur');
            onClose();
            break;
          case 't':
            e.preventDefault();
            console.log('Nouveau test');
            onClose();
            break;
          case 'a':
            e.preventDefault();
            console.log('Nouveau rendez-vous');
            onClose();
            break;
          case 'd':
            e.preventDefault();
            console.log('Dashboard');
            onClose();
            break;
          case 'u':
            e.preventDefault();
            console.log('Utilisateurs');
            onClose();
            break;
          case 'c':
            e.preventDefault();
            console.log('Contenu');
            onClose();
            break;
          case 's':
            e.preventDefault();
            console.log('Paramètres');
            onClose();
            break;
          case 'e':
            e.preventDefault();
            console.log('Exporter données');
            onClose();
            break;
          case 'b':
            e.preventDefault();
            console.log('Notifications');
            onClose();
            break;
          case 'm':
            e.preventDefault();
            console.log('Mode sombre/clair');
            onClose();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Keyboard className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Raccourcis clavier</CardTitle>
                <p className="text-sm text-gray-600">Accélérez votre workflow avec ces raccourcis</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Navigation des catégories */}
          <div className="px-6 pb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Liste des raccourcis */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {shortcut.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{shortcut.description}</p>
                      <p className="text-xs text-gray-500">Action rapide</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Pied de page avec conseils */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Conseil: Utilisez ⌘ + / pour ouvrir ce menu à tout moment</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>⌘ = Cmd (Mac) / Ctrl (Windows)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 