import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  Star,
  Filter,
  Search,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Award,
  TrendingUp,
  UserPlus,
  UserMinus,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Application {
  id: number;
  candidate_id: number;
  job_posting_id: number;
  status: 'applied' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  cover_letter: string;
  expected_salary: number;
  availability_date: string;
  applied_at: string;
  updated_at: string;
  rating?: number;
  feedback?: string;
  candidate_first_name: string;
  candidate_last_name: string;
  candidate_email: string;
  candidate_phone?: string;
  job_title: string;
  company_name: string;
  match_score?: number;
  ats_score?: number;
  is_auto_matched?: boolean;
}

interface RecruitmentPipelineProps {
  className?: string;
}

const pipelineStages = [
  { key: 'applied', label: 'Candidatures', color: 'bg-blue-100 text-blue-800', icon: Users },
  { key: 'reviewed', label: 'En cours de lecture', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  { key: 'shortlisted', label: 'Shortlist', color: 'bg-green-100 text-green-800', icon: Star },
  { key: 'interview_scheduled', label: 'Entretien planifié', color: 'bg-purple-100 text-purple-800', icon: Calendar },
  { key: 'interviewed', label: 'Entretien réalisé', color: 'bg-indigo-100 text-indigo-800', icon: MessageSquare },
  { key: 'offered', label: 'Offre faite', color: 'bg-orange-100 text-orange-800', icon: Award },
  { key: 'hired', label: 'Embauché', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { key: 'rejected', label: 'Refusé', color: 'bg-red-100 text-red-800', icon: XCircle }
];

export const RecruitmentPipeline: React.FC<RecruitmentPipelineProps> = ({ className }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // Simulation de données - en production, appeler l'API
      const mockApplications: Application[] = [
        {
          id: 1,
          candidate_id: 3,
          job_posting_id: 1,
          status: 'reviewed',
          cover_letter: 'Je suis très intéressé par ce poste...',
          expected_salary: 1000000,
          availability_date: '2024-02-01',
          applied_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-16T14:20:00Z',
          rating: 4,
          candidate_first_name: 'Marie',
          candidate_last_name: 'Mabiala',
          candidate_email: 'marie.mabiala@email.com',
          candidate_phone: '+242 05 123 456',
          job_title: 'Développeur Full Stack',
          company_name: 'Orange Congo',
          match_score: 87,
          ats_score: 82,
          is_auto_matched: true
        },
        {
          id: 2,
          candidate_id: 4,
          job_posting_id: 2,
          status: 'shortlisted',
          cover_letter: 'Mon expérience en génie pétrolier...',
          expected_salary: 2000000,
          availability_date: '2024-02-15',
          applied_at: '2024-01-14T09:15:00Z',
          updated_at: '2024-01-17T11:30:00Z',
          rating: 5,
          candidate_first_name: 'Pierre',
          candidate_last_name: 'Kouba',
          candidate_email: 'pierre.kouba@email.com',
          candidate_phone: '+242 05 234 567',
          job_title: 'Ingénieur Pétrolier',
          company_name: 'Total Energies Congo',
          match_score: 72,
          ats_score: 78,
          is_auto_matched: true
        },
        {
          id: 3,
          candidate_id: 5,
          job_posting_id: 3,
          status: 'interview_scheduled',
          cover_letter: 'Je suis analyste financier avec...',
          expected_salary: 1200000,
          availability_date: '2024-02-10',
          applied_at: '2024-01-13T16:45:00Z',
          updated_at: '2024-01-18T09:00:00Z',
          rating: 4,
          candidate_first_name: 'Sarah',
          candidate_last_name: 'Nzouba',
          candidate_email: 'sarah.nzouba@email.com',
          job_title: 'Analyste Financier',
          company_name: 'Ecobank Congo',
          match_score: 85,
          ats_score: 88,
          is_auto_matched: false
        }
      ];

      setApplications(mockApplications);
    } catch (error) {
      console.error('Erreur chargement candidatures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any, updated_at: new Date().toISOString() }
            : app
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const filteredApplications = selectedStage === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStage);

  const getStageStats = () => {
    const stats: { [key: string]: number } = {};
    pipelineStages.forEach(stage => {
      stats[stage.key] = applications.filter(app => app.status === stage.key).length;
    });
    return stats;
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

  const getStatusColor = (status: string) => {
    const stage = pipelineStages.find(s => s.key === status);
    return stage ? stage.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const stage = pipelineStages.find(s => s.key === status);
    return stage ? stage.icon : Clock;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement du pipeline...</span>
      </div>
    );
  }

  const stageStats = getStageStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Pipeline de Recrutement
            </h1>
            <p className="text-gray-600 text-lg">Suivez vos candidatures étape par étape</p>
          </div>
        </div>
      </motion.div>

      {/* Statistiques par étape */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
      >
        {pipelineStages.map((stage, index) => {
          const Icon = stage.icon;
          const count = stageStats[stage.key] || 0;
          
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedStage === stage.key ? 'ring-2 ring-blue-500' : ''
              }`} onClick={() => setSelectedStage(stage.key)}>
                <CardContent className="p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold mb-1">{count}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${stage.color}`}>
                    {stage.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filtres et actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par étape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les étapes</SelectItem>
                    {pipelineStages.map(stage => (
                      <SelectItem key={stage.key} value={stage.key}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm text-gray-600">
                  {filteredApplications.length} candidature{filteredApplications.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Plus de filtres
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des candidatures */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredApplications.map((application, index) => {
            const StatusIcon = getStatusIcon(application.status);
            
            return (
              <motion.div
                key={application.id}
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
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">
                              {application.candidate_first_name} {application.candidate_last_name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{application.job_title}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{application.company_name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Statut</div>
                            <Badge className={`${getStatusColor(application.status)} text-xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {pipelineStages.find(s => s.key === application.status)?.label}
                            </Badge>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-gray-500">Match Score</div>
                            <div className="text-lg font-semibold text-blue-600">
                              {application.match_score || 0}%
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-gray-500">ATS Score</div>
                            <div className="text-lg font-semibold text-green-600">
                              {application.ats_score || 0}%
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-gray-500">Salaire attendu</div>
                            <div className="text-lg font-semibold text-purple-600">
                              {application.expected_salary?.toLocaleString()} FCFA
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Candidature: {formatDate(application.applied_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Disponible: {new Date(application.availability_date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {application.candidate_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{application.candidate_phone}</span>
                            </div>
                          )}
                        </div>

                        {application.rating && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-500">Note:</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < application.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {application.feedback && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">Feedback:</div>
                            <div className="text-sm text-gray-600">{application.feedback}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir CV
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contacter
                        </Button>
                        
                        {/* Actions selon le statut */}
                        {application.status === 'reviewed' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Shortlister
                          </Button>
                        )}

                        {application.status === 'shortlisted' && (
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => updateApplicationStatus(application.id, 'interview_scheduled')}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Planifier entretien
                          </Button>
                        )}

                        {application.status === 'interviewed' && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateApplicationStatus(application.id, 'offered')}
                            >
                              <Award className="w-4 h-4 mr-1" />
                              Faire offre
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Refuser
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredApplications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune candidature trouvée</h3>
            <p className="text-gray-500">
              {selectedStage === 'all' 
                ? 'Aucune candidature pour le moment' 
                : `Aucune candidature à l'étape "${pipelineStages.find(s => s.key === selectedStage)?.label}"`
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
