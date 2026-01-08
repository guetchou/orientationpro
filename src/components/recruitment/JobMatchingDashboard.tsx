import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Star,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  Building2,
  ArrowRight,
  Sparkles,
  Lightbulb,
  ThumbsUp,
  Clock
} from 'lucide-react';

interface MatchingResult {
  id: number;
  job_posting_id: number;
  candidate_id: number;
  match_score: number;
  skills_match: number;
  experience_match: number;
  education_match: number;
  location_match: number;
  salary_match: number;
  language_match: number;
  ats_score: number;
  matching_criteria: {
    skills: {
      required_match: number;
      preferred_match: number;
      technical_skills: number;
      soft_skills: number;
    };
    experience: {
      candidate_years: number;
      required_level: string;
      job_level: string;
    };
    education: {
      candidate_level: number;
      required_level: number;
      job_level: string;
    };
    location: {
      job_location: string;
      remote_allowed: boolean;
      match: string;
    };
    salary: {
      job_min: number;
      job_max: number;
      match: string;
    };
    language: {
      job_languages: string[];
      match: string;
    };
  };
  recommendations: string;
  is_auto_matched: boolean;
  is_viewed_by_recruiter: boolean;
  is_shortlisted: boolean;
  created_at: string;
  job_title?: string;
  candidate_name?: string;
  company_name?: string;
}

interface JobMatchingDashboardProps {
  className?: string;
}

export const JobMatchingDashboard: React.FC<JobMatchingDashboardProps> = ({ className }) => {
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  useEffect(() => {
    loadMatchingResults();
  }, []);

  const loadMatchingResults = async () => {
    setIsLoading(true);
    try {
      // Pour l'instant, on simule des données
      // En production, on appellerait l'API
      const mockData: MatchingResult[] = [
        {
          id: 1,
          job_posting_id: 1,
          candidate_id: 3,
          match_score: 87,
          skills_match: 85,
          experience_match: 90,
          education_match: 95,
          location_match: 100,
          salary_match: 88,
          language_match: 100,
          ats_score: 82,
          matching_criteria: {
            skills: {
              required_match: 85,
              preferred_match: 70,
              technical_skills: 8,
              soft_skills: 5
            },
            experience: {
              candidate_years: 3,
              required_level: 'mid',
              job_level: 'mid'
            },
            education: {
              candidate_level: 2,
              required_level: 2,
              job_level: 'bachelor'
            },
            location: {
              job_location: 'Brazzaville',
              remote_allowed: true,
              match: 'remote_ok'
            },
            salary: {
              job_min: 800000,
              job_max: 1200000,
              match: 'acceptable'
            },
            language: {
              job_languages: ['Français', 'Anglais'],
              match: 'french_ok'
            }
          },
          recommendations: 'Excellent match ! Candidature recommandée',
          is_auto_matched: true,
          is_viewed_by_recruiter: false,
          is_shortlisted: false,
          created_at: '2024-01-15T10:30:00Z',
          job_title: 'Développeur Full Stack',
          candidate_name: 'Marie Mabiala',
          company_name: 'Orange Congo'
        },
        {
          id: 2,
          job_posting_id: 2,
          candidate_id: 4,
          match_score: 72,
          skills_match: 65,
          experience_match: 80,
          education_match: 85,
          location_match: 60,
          salary_match: 75,
          language_match: 90,
          ats_score: 78,
          matching_criteria: {
            skills: {
              required_match: 65,
              preferred_match: 55,
              technical_skills: 6,
              soft_skills: 4
            },
            experience: {
              candidate_years: 2,
              required_level: 'senior',
              job_level: 'senior'
            },
            education: {
              candidate_level: 2,
              required_level: 3,
              job_level: 'master'
            },
            location: {
              job_location: 'Pointe-Noire',
              remote_allowed: false,
              match: 'local'
            },
            salary: {
              job_min: 1500000,
              job_max: 2500000,
              match: 'acceptable'
            },
            language: {
              job_languages: ['Français', 'Anglais'],
              match: 'french_ok'
            }
          },
          recommendations: 'Bon match avec quelques améliorations possibles',
          is_auto_matched: true,
          is_viewed_by_recruiter: false,
          is_shortlisted: false,
          created_at: '2024-01-15T09:15:00Z',
          job_title: 'Ingénieur Pétrolier',
          candidate_name: 'Pierre Kouba',
          company_name: 'Total Energies Congo'
        }
      ];

      setMatchingResults(mockData);
    } catch (error) {
      console.error('Erreur chargement matching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAutomaticMatching = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/matching/auto-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (data.success) {
        await loadMatchingResults();
      }
    } catch (error) {
      console.error('Erreur matching automatique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    return 'Faible';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement du matching...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec titre moderne */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Matching IA
            </h1>
            <p className="text-gray-600 text-lg">Intelligence artificielle pour le recrutement</p>
          </div>
        </div>
      </motion.div>

      {/* Statistiques globales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{matchingResults.length}</div>
            <div className="text-sm text-gray-600">Matches trouvés</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {matchingResults.filter(r => r.match_score >= 80).length}
            </div>
            <div className="text-sm text-gray-600">Matches excellents</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {new Set(matchingResults.map(r => r.candidate_id)).size}
            </div>
            <div className="text-sm text-gray-600">Candidats uniques</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {new Set(matchingResults.map(r => r.job_posting_id)).size}
            </div>
            <div className="text-sm text-gray-600">Offres d'emploi</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Matching Automatique</h3>
                <p className="text-gray-600">
                  Déclenchez le matching IA pour analyser tous les candidats et offres d'emploi
                </p>
              </div>
              <Button 
                onClick={triggerAutomaticMatching}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Lancer le matching
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs pour différentes vues */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="by-job">Par offre d'emploi</TabsTrigger>
            <TabsTrigger value="by-candidate">Par candidat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Liste des matches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Tous les matches</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadMatchingResults}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {matchingResults.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div>
                                <h4 className="text-lg font-bold">{match.job_title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">{match.company_name}</span>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-500">{match.candidate_name}</span>
                                </div>
                              </div>
                            </div>

                            {/* Score de matching */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(match.match_score)}`}>
                                  <Target className="w-4 h-4 mr-1" />
                                  {match.match_score}% - {getMatchScoreLabel(match.match_score)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Score global</div>
                              </div>

                              <div className="text-center">
                                <div className="text-lg font-semibold text-blue-600">{match.skills_match}%</div>
                                <div className="text-xs text-gray-500">Compétences</div>
                              </div>

                              <div className="text-center">
                                <div className="text-lg font-semibold text-green-600">{match.experience_match}%</div>
                                <div className="text-xs text-gray-500">Expérience</div>
                              </div>

                              <div className="text-center">
                                <div className="text-lg font-semibold text-purple-600">{match.ats_score}%</div>
                                <div className="text-xs text-gray-500">ATS Score</div>
                              </div>
                            </div>

                            {/* Recommandations */}
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <div className="font-medium text-blue-900">Recommandation IA</div>
                                <div className="text-sm text-blue-700">{match.recommendations}</div>
                              </div>
                            </div>

                            {/* Métadonnées */}
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(match.created_at)}</span>
                              </div>
                              {match.is_auto_matched && (
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Auto-matché
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-6">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Voir détails
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Contacter
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Shortlister
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {matchingResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun match trouvé</h3>
                  <p className="text-gray-500 mb-4">Lancez le matching automatique pour analyser les candidats et offres</p>
                  <Button onClick={triggerAutomaticMatching}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Lancer le matching
                  </Button>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="by-job" className="space-y-6">
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Vue par offre d'emploi</h3>
              <p className="text-gray-500">Fonctionnalité en cours de développement</p>
            </div>
          </TabsContent>

          <TabsContent value="by-candidate" className="space-y-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Vue par candidat</h3>
              <p className="text-gray-500">Fonctionnalité en cours de développement</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
