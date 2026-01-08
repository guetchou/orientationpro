import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Zap,
  Award,
  Calendar
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
  company_name: string;
  company_logo?: string;
  company_verified: boolean;
  urgent: boolean;
  featured: boolean;
  created_at: string;
  views_count: number;
  applications_count: number;
}

export const FeaturedJobsSection: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedJobs();
  }, []);

  const loadFeaturedJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/list?featured=true&limit=6`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Erreur chargement offres:', error);
    } finally {
      setIsLoading(false);
    }
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
    return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Chargement des offres d'emploi...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6">
        {/* En-tête de section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Offres en vedette
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Les meilleures opportunités
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              vous attendent
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Découvrez les offres d'emploi les plus attractives du marché congolais, 
            sélectionnées par notre équipe et nos entreprises partenaires.
          </p>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
              <div className="text-sm text-gray-600">Offres premium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {new Set(jobs.map(job => job.company_name)).size}
              </div>
              <div className="text-sm text-gray-600">Entreprises partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {jobs.reduce((sum, job) => sum + job.applications_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Candidatures reçues</div>
            </div>
          </div>
        </motion.div>

        {/* Grille des offres d'emploi */}
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`group hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                  job.featured ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' : 
                  job.urgent ? 'border-2 border-red-300 bg-gradient-to-br from-red-50 to-pink-50' : 
                  'border-0 bg-white'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
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
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{job.company_name}</span>
                            {job.company_verified && (
                              <Award className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {job.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {job.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{getEmploymentTypeLabel(job.employment_type)} • {getExperienceLevelLabel(job.experience_level)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{job.applications_count} candidatures</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(job.created_at)}</span>
                        </div>
                      </div>

                      <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Link to="/recruitment">
                          Voir
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune offre en vedette</h3>
            <p className="text-gray-500 mb-6">De nouvelles offres seront bientôt disponibles</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link to="/recruitment">
                Voir toutes les offres
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        )}

        {/* CTA vers le job board */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-blue-100 mb-6">
                Explorez notre job board complet avec plus de 500 offres d'emploi 
                dans tous les secteurs d'activité au Congo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Link to="/recruitment">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Voir toutes les offres
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
                  <Link to="/cv-optimizer">
                    <Target className="w-5 h-5 mr-2" />
                    Optimiser mon CV
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
