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
  Globe,
  CheckCircle,
  ArrowRight,
  Bookmark,
  Send,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
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

interface ProfessionalJobBoardProps {
  className?: string;
}

export const ProfessionalJobBoard: React.FC<ProfessionalJobBoardProps> = ({ className }) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

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

  const toggleSavedJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleApplyJob = (job: JobPosting) => {
    // Logique d'application
    console.log('Application pour:', job.title);
    // Ici on pourrait ouvrir un modal d'application ou rediriger
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels = {
      'full_time': 'CDI',
      'part_time': 'CDD',
      'contract': 'Contrat',
      'internship': 'Stage',
      'freelance': 'Freelance',
      'CDI': 'CDI',
      'CDD': 'CDD',
      'Stage': 'Stage'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`;
    return `Il y a ${Math.floor(diffInHours / 168)} sem`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${className}`}>
      {/* Header Professionnel */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            
            {/* Titre et Description */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Opportunités d'Emploi au Congo
              </h1>
              <p className="text-lg text-gray-600">
                Découvrez les meilleures opportunités de carrière avec les entreprises leaders du Congo
              </p>
            </div>

            {/* Statistiques */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredJobs.length}</div>
                <div className="text-sm text-gray-500">Offres actives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{jobs.filter(j => j.featured).length}</div>
                <div className="text-sm text-gray-500">En vedette</div>
              </div>
            </div>
          </div>

          {/* Barre de Recherche Professionnelle */}
          <div className="mt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher par poste, entreprise, compétences..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="h-12 px-6 border-2 border-gray-200 hover:border-blue-500 rounded-xl"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtres
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            {/* Filtres Avancés */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-gray-50 rounded-xl p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
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
                      <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
                        <SelectValue placeholder="Type de contrat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="Contrat">Contrat</SelectItem>
                        <SelectItem value="Stage">Stage</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
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
                      <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg">
                        <SelectValue placeholder="Secteur d'activité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les secteurs</SelectItem>
                        <SelectItem value="Informatique">Informatique</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Santé">Santé</SelectItem>
                        <SelectItem value="Éducation">Éducation</SelectItem>
                        <SelectItem value="Ingénierie">Ingénierie</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                        Offres en vedette uniquement
                      </label>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedLocation('all');
                        setSelectedType('all');
                        setSelectedLevel('all');
                        setSelectedIndustry('all');
                        setShowFeaturedOnly(false);
                      }}
                    >
                      Effacer les filtres
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-lg">Chargement des offres d'emploi...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Liste des Offres */}
            <div className="lg:col-span-2 space-y-6">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-20">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
                  <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
                </div>
              ) : (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {job.featured && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                  <Star className="w-3 h-3 mr-1" />
                                  En vedette
                                </Badge>
                              )}
                              {job.company_verified && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Vérifié
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-blue-200 text-blue-600">
                                {getEmploymentTypeLabel(job.employment_type)}
                              </Badge>
                            </div>
                            
                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {job.title}
                            </CardTitle>
                            
                            <div className="flex items-center gap-4 text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium">{job.company_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{getTimeAgo(job.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSavedJob(job.id)}
                              className={`p-2 ${savedJobs.includes(job.id) ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                            >
                              <Bookmark className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-blue-600">
                              <Share2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
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
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Contacter
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApplyJob(job)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Postuler
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Offres Sauvegardées */}
              {savedJobs.length > 0 && (
                <Card className="rounded-2xl border-2 border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-blue-600" />
                      Offres sauvegardées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Vous avez sauvegardé {savedJobs.length} offre{savedJobs.length > 1 ? 's' : ''}
                    </p>
                    <Button variant="outline" className="w-full">
                      Voir mes sauvegardes
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Conseils de Carrière */}
              <Card className="rounded-2xl border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Conseils de carrière
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">Optimisez votre CV</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Assurez-vous que votre CV est à jour et adapté au poste
                    </p>
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-600">
                      Optimiser mon CV
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h4 className="font-semibold text-green-900 mb-2">Préparez-vous</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Entraînez-vous avec nos tests d'orientation professionnelle
                    </p>
                    <Button size="sm" variant="outline" className="border-green-200 text-green-600">
                      Commencer les tests
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Entreprises qui recrutent */}
              <Card className="rounded-2xl border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Entreprises qui recrutent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Orange Congo', 'Total Energies', 'MTN Congo', 'Banque Commerciale'].map((company, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{company}</p>
                          <p className="text-sm text-gray-500">3 offres actives</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
