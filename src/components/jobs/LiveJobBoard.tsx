import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Users, 
  Eye, 
  ExternalLink,
  Filter,
  Search,
  Star,
  CheckCircle,
  TrendingUp,
  Calendar,
  Briefcase,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  type: string;
  category: string;
  source: string;
  publishedDate: string;
  requirements?: string[];
  benefits?: string[];
  views: number;
  applications: number;
  isVerified: boolean;
  isFeatured: boolean;
}

interface JobStatistics {
  totalJobs: number;
  activeJobs: number;
  featuredJobs: number;
  verifiedJobs: number;
  recentJobs: number;
}

/**
 * Composant Live Job Board - Affichage des offres d'emploi en temps réel
 */
export const LiveJobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [statistics, setStatistics] = useState<JobStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{category: string, count: number}[]>([]);

  // Charger les offres d'emploi
  useEffect(() => {
    loadJobs();
    loadStatistics();
    loadCategories();
  }, []);

  // Filtrer les offres
  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCategory, selectedLocation, selectedType]);

  const loadJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs?limit=50`);
      const data = await response.json();
      if (data.success) {
        setJobs(data.data.jobs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/statistics`);
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data.overview);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.category.toLowerCase().includes(term)
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Filtre par localisation
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(job => job.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    // Trier par date de publication et statut
    filtered.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
      if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

    setFilteredJobs(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Informatique': 'bg-blue-100 text-blue-800 border-blue-200',
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Marketing': 'bg-purple-100 text-purple-800 border-purple-200',
      'Santé': 'bg-red-100 text-red-800 border-red-200',
      'Éducation': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Ingénierie': 'bg-orange-100 text-orange-800 border-orange-200',
      'Commerce': 'bg-pink-100 text-pink-800 border-pink-200',
      'Administration': 'bg-gray-100 text-gray-800 border-gray-200',
      'Ressources Humaines': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Logistique': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'CDI': 'bg-green-100 text-green-800 border-green-200',
      'CDD': 'bg-blue-100 text-blue-800 border-blue-200',
      'Stage': 'bg-purple-100 text-purple-800 border-purple-200',
      'Freelance': 'bg-orange-100 text-orange-800 border-orange-200',
      'Temps partiel': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Intérim': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Chargement des offres d'emploi...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        
        {/* Header avec statistiques */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
              <TrendingUp className="w-4 h-4 mr-2" />
              Offres d'Emploi en Temps Réel
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Job Board Live
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Découvrez les dernières offres d'emploi au Congo, mises à jour automatiquement 
              depuis les principales plateformes d'emploi.
            </p>
          </motion.div>

          {/* Statistiques */}
          {statistics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8"
            >
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{statistics.activeJobs}</div>
                <div className="text-sm text-gray-600">Offres Actives</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-purple-600">{statistics.featuredJobs}</div>
                <div className="text-sm text-gray-600">En Vedette</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-green-600">{statistics.verifiedJobs}</div>
                <div className="text-sm text-gray-600">Vérifiées</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-orange-600">{statistics.recentJobs}</div>
                <div className="text-sm text-gray-600">Cette Semaine</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-red-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Catégories</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Rechercher un emploi, une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bouton filtres */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category} value={cat.category}>
                          {cat.category} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Localisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les localisations</SelectItem>
                      <SelectItem value="brazzaville">Brazzaville</SelectItem>
                      <SelectItem value="pointe-noire">Pointe-Noire</SelectItem>
                      <SelectItem value="dolisie">Dolisie</SelectItem>
                      <SelectItem value="remote">Télétravail</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Temps partiel">Temps partiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Liste des offres */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    
                    {/* Logo entreprise (placeholder) */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        
                        {/* Titre et entreprise */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                            {job.isFeatured && (
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            )}
                            {job.isVerified && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              <span className="font-medium">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(job.publishedDate)}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={getCategoryColor(job.category)}>
                              <Briefcase className="w-3 h-3 mr-1" />
                              {job.category}
                            </Badge>
                            <Badge className={getTypeColor(job.type)}>
                              <Award className="w-3 h-3 mr-1" />
                              {job.type}
                            </Badge>
                            {job.salary && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {job.salary}
                              </Badge>
                            )}
                          </div>

                          {/* Statistiques */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{job.views} vues</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{job.applications} candidatures</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Source: {job.source}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => window.open(job.url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Voir l'offre
                          </Button>
                          <Button variant="outline" size="sm">
                            Sauvegarder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Message si aucune offre */}
        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500 text-lg">
              Aucune offre d'emploi trouvée avec ces critères.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
                setSelectedType('all');
              }}
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          </motion.div>
        )}

        {/* Bouton de mise à jour */}
        <div className="text-center mt-8">
          <Button
            onClick={loadJobs}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Actualiser les offres
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveJobBoard;
