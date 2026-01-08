import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Star, 
  TrendingUp,
  Filter,
  Briefcase,
  Users,
  Award,
  Calendar,
  ExternalLink,
  Heart,
  Share2,
  Eye,
  Zap,
  Target,
  Globe
} from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  benefits: string[];
  skills_required: string[];
  skills_preferred: string[];
  languages: string[];
  remote_allowed: boolean;
  urgent: boolean;
  featured: boolean;
  created_at: string;
  views_count: number;
  applications_count: number;
  company_name: string;
  company_logo?: string;
  company_verified: boolean;
  company_industry: string;
}

interface ModernJobBoardProps {
  className?: string;
}

export const ModernJobBoard: React.FC<ModernJobBoardProps> = ({ className }) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
  }, [currentPage]);

  useEffect(() => {
    if (jobs.length > 0) {
      applyFilters();
    }
  }, [jobs, searchTerm, selectedLocation, selectedType, selectedLevel, selectedIndustry, showFeaturedOnly]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Chargement des offres d\'emploi...');
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/jobs?page=${currentPage}&limit=12`;
      console.log('📍 URL API:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Données reçues:', data);
      
      if (data.success && data.data && data.data.jobs) {
        // Adapter les données de notre API au format attendu
        const adaptedJobs = data.data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          description: job.description || '',
          location: job.location,
          employment_type: job.type,
          experience_level: 'Tous niveaux',
          salary_min: 0,
          salary_max: 0,
          currency: 'FCFA',
          benefits: job.benefits || [],
          skills_required: job.requirements || [],
          skills_preferred: [],
          languages: ['Français'],
          remote_allowed: false,
          urgent: false,
          featured: job.isFeatured,
          created_at: job.publishedDate,
          views_count: job.views,
          applications_count: job.applications,
          company_name: job.company,
          company_logo: undefined,
          company_verified: job.isVerified,
          company_industry: job.category
        }));
        
        console.log('✅ Offres adaptées:', adaptedJobs.length);
        setJobs(adaptedJobs);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        console.error('❌ Format de données incorrect:', data);
        setJobs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('❌ Erreur chargement offres:', error);
      setJobs([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
      console.log('🏁 Chargement terminé');
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation && selectedLocation !== 'all') {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(job => job.employment_type === selectedType);
    }

    if (selectedLevel && selectedLevel !== 'all') {
      filtered = filtered.filter(job => job.experience_level === selectedLevel);
    }

    if (selectedIndustry && selectedIndustry !== 'all') {
      filtered = filtered.filter(job => job.company_industry === selectedIndustry);
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(job => job.featured);
    }

    setFilteredJobs(filtered);
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels = {
      'full_time': 'CDI',
      'part_time': 'CDD',
      'contract': 'Contrat',
      'internship': 'Stage',
      'freelance': 'Freelance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      'entry': 'Débutant',
      'junior': 'Junior',
      'mid': 'Intermédiaire',
      'senior': 'Senior',
      'lead': 'Lead',
      'executive': 'Executive'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min || !max) return 'Salaire non spécifié';
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return `Il y a ${Math.ceil(diffDays / 30)} mois`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des offres d'emploi...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* En-tête avec titre moderne */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Job Board Congo
            </h1>
            <p className="text-gray-600 text-lg">Trouvez votre emploi idéal au Congo</p>
          </div>
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Barre de recherche principale */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher par poste, entreprise ou mot-clé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>

              {/* Filtres */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Localisation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    <SelectItem value="Brazzaville">Brazzaville</SelectItem>
                    <SelectItem value="Pointe-Noire">Pointe-Noire</SelectItem>
                    <SelectItem value="Dolisie">Dolisie</SelectItem>
                    <SelectItem value="Nkayi">Nkayi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="full_time">CDI</SelectItem>
                    <SelectItem value="part_time">CDD</SelectItem>
                    <SelectItem value="contract">Contrat</SelectItem>
                    <SelectItem value="internship">Stage</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau d'expérience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="entry">Débutant</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Intermédiaire</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Secteur d'activité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les secteurs</SelectItem>
                    <SelectItem value="Télécommunications">Télécommunications</SelectItem>
                    <SelectItem value="Pétrole et Gaz">Pétrole et Gaz</SelectItem>
                    <SelectItem value="Banque et Finance">Banque et Finance</SelectItem>
                    <SelectItem value="Technologie">Technologie</SelectItem>
                    <SelectItem value="Médias">Médias</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showFeaturedOnly ? "default" : "outline"}
                  onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  className="flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Offres Premium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistiques rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="text-center">
          <CardContent className="p-6">
            <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{filteredJobs.length}</div>
            <div className="text-sm text-gray-600">Offres disponibles</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Building2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {new Set(filteredJobs.map(job => job.company_name)).size}
            </div>
            <div className="text-sm text-gray-600">Entreprises</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {filteredJobs.filter(job => job.urgent).length}
            </div>
            <div className="text-sm text-gray-600">Offres urgentes</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {filteredJobs.filter(job => job.featured).length}
            </div>
            <div className="text-sm text-gray-600">Offres Premium</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des offres d'emploi */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                job.featured ? 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' : 
                job.urgent ? 'border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {job.company_logo ? (
                          <img 
                            src={job.company_logo} 
                            alt={job.company_name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{job.company_name}</span>
                            {job.company_verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Vérifié
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          <span>{getExperienceLevelLabel(job.experience_level)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                        </div>
                        {job.remote_allowed && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Globe className="w-4 h-4" />
                            <span>Télétravail</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills_required.slice(0, 4).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills_required.length - 4}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{job.views_count} vues</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{job.applications_count} candidatures</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(job.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            Postuler
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      {job.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {job.urgent && (
                        <Badge variant="destructive">
                          <Zap className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                size="sm"
              >
                {page}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

