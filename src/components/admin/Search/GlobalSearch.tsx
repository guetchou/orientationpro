import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Command, Users, FileText, Calendar, Settings, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'user' | 'test' | 'appointment' | 'report' | 'setting';
  url: string;
  icon: React.ReactNode;
  relevance: number;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Données simulées pour la recherche
  const mockData: SearchResult[] = [
    {
      id: '1',
      title: 'Marie Dupont',
      description: 'Étudiante - Test d\'orientation complété le 15/12/2024',
      type: 'user',
      url: '/admin/users/1',
      icon: <Users className="h-4 w-4" />,
      relevance: 0.95
    },
    {
      id: '2',
      title: 'Rapport d\'orientation - Marie Dupont',
      description: 'Résultats détaillés du test d\'orientation',
      type: 'report',
      url: '/admin/reports/1',
      icon: <FileText className="h-4 w-4" />,
      relevance: 0.85
    },
    {
      id: '3',
      title: 'Rendez-vous - Jean Martin',
      description: 'Consultation d\'orientation - 16/12/2024 à 14h',
      type: 'appointment',
      url: '/admin/appointments/3',
      icon: <Calendar className="h-4 w-4" />,
      relevance: 0.75
    },
    {
      id: '4',
      title: 'Test d\'orientation - Version 2025',
      description: 'Configuration du test d\'orientation',
      type: 'test',
      url: '/admin/tests/config',
      icon: <FileText className="h-4 w-4" />,
      relevance: 0.65
    },
    {
      id: '5',
      title: 'Paramètres système',
      description: 'Configuration générale de l\'application',
      type: 'setting',
      url: '/admin/settings',
      icon: <Settings className="h-4 w-4" />,
      relevance: 0.55
    }
  ];

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'test': return 'bg-green-100 text-green-800';
      case 'appointment': return 'bg-purple-100 text-purple-800';
      case 'report': return 'bg-orange-100 text-orange-800';
      case 'setting': return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return 'Utilisateur';
      case 'test': return 'Test';
      case 'appointment': return 'Rendez-vous';
      case 'report': return 'Rapport';
      case 'setting': return 'Paramètre';
    }
  };

  const searchData = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une recherche avec délai
    await new Promise(resolve => setTimeout(resolve, 300));

    const filtered = mockData.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Tri par pertinence
    const sorted = filtered.sort((a, b) => b.relevance - a.relevance);
    setResults(sorted);
    setIsLoading(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchData(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleResultClick = (result: SearchResult) => {
    console.log('Navigation vers:', result.url);
    // Ici on pourrait utiliser navigate() de React Router
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-0">
          {/* Barre de recherche */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher utilisateurs, tests, rapports..."
                value={query}
                onChange={handleInputChange}
                className="flex-1 text-lg outline-none placeholder-gray-400"
              />
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Recherche en cours...</p>
              </div>
            ) : query && results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun résultat trouvé pour "{query}"</p>
                <p className="text-sm">Essayez d'autres mots-clés</p>
              </div>
            ) : !query ? (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Recherches récentes</h3>
                    <div className="space-y-1">
                      <button className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded">
                        <Users className="h-4 w-4" />
                        <span>Marie Dupont</span>
                      </button>
                      <button className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded">
                        <FileText className="h-4 w-4" />
                        <span>Rapport orientation</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Actions rapides</h3>
                    <div className="space-y-1">
                      <button className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded">
                        <Users className="h-4 w-4" />
                        <span>Nouvel utilisateur</span>
                      </button>
                      <button className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded">
                        <Calendar className="h-4 w-4" />
                        <span>Nouveau rendez-vous</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1 text-gray-400">
                        {result.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {result.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getTypeColor(result.type)}`}
                            >
                              {getTypeLabel(result.type)}
                            </Badge>
                            {index === selectedIndex && (
                              <div className="flex items-center space-x-1 text-xs text-gray-400">
                                <ArrowRight className="h-3 w-3" />
                                <span>Entrée</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pied de page */}
          {query && results.length > 0 && (
            <div className="p-3 border-t bg-gray-50 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>{results.length} résultat(s) trouvé(s)</span>
                <div className="flex items-center space-x-4">
                  <span>↑↓ pour naviguer</span>
                  <span>Entrée pour sélectionner</span>
                  <span>Échap pour fermer</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 