import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  Star, 
  Clock, 
  Users, 
  TrendingUp,
  Eye,
  Download,
  Share2,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Target,
  BarChart3,
  User,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

/**
 * Composant de carte de candidat inspiré de Greenhouse/Lever
 */
export const CandidateCard: React.FC<{
  candidate: {
    id: string;
    name: string;
    position: string;
    experience: string;
    location: string;
    avatar: string;
    score: number;
    status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired';
    skills: string[];
    lastActivity: string;
  };
  onViewProfile?: () => void;
  onMoveToNextStage?: () => void;
}> = ({ candidate, onViewProfile, onMoveToNextStage }) => {
  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    screening: 'bg-yellow-100 text-yellow-800',
    interview: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800'
  };

  const statusIcons = {
    applied: CheckCircle,
    screening: Clock,
    interview: Calendar,
    offer: Star,
    hired: CheckCircle
  };

  const StatusIcon = statusIcons[candidate.status];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                <p className="text-sm text-gray-600">{candidate.position}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{candidate.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${statusColors[candidate.status]} text-xs`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {candidate.status}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Score de matching */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Score de matching</span>
              <span className="text-sm font-bold text-blue-600">{candidate.score}%</span>
            </div>
            <Progress value={candidate.score} className="h-2" />
          </div>

          {/* Compétences */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{candidate.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{candidate.lastActivity}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onViewProfile}>
                <Eye className="w-4 h-4 mr-1" />
                Voir
              </Button>
              {candidate.status !== 'hired' && (
                <Button size="sm" onClick={onMoveToNextStage}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Composant de pipeline de recrutement inspiré de Workday
 */
export const RecruitmentPipeline: React.FC<{
  stages: {
    id: string;
    name: string;
    candidates: number;
    color: string;
  }[];
  onStageClick?: (stageId: string) => void;
}> = ({ stages, onStageClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {stages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
          onClick={() => onStageClick?.(stage.id)}
        >
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <Badge variant="secondary" className="text-xs">
                  {stage.candidates}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium text-gray-900">
                {stage.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {/* Candidats simulés */}
                {[...Array(Math.min(stage.candidates, 3))].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="flex-1 h-2 bg-gray-100 rounded" />
                  </div>
                ))}
                {stage.candidates > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{stage.candidates - 3} autres
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Composant de dashboard analytics inspiré de Lever
 */
export const AnalyticsDashboard: React.FC<{
  metrics: {
    title: string;
    value: string;
    change: number;
    icon: React.ElementType;
    color: string;
  }[];
}> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className={`w-4 h-4 mr-1 ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Composant de filtre avancé inspiré de Greenhouse
 */
export const AdvancedFilter: React.FC<{
  onFilterChange?: (filters: any) => void;
}> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    skills: '',
    status: '',
    dateRange: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtres avancés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expérience
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              <option value="entry">Débutant (0-2 ans)</option>
              <option value="junior">Junior (2-5 ans)</option>
              <option value="senior">Senior (5+ ans)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">Toutes les villes</option>
              <option value="brazzaville">Brazzaville</option>
              <option value="pointe-noire">Pointe-Noire</option>
              <option value="dolisie">Dolisie</option>
              <option value="remote">Télétravail</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="applied">Candidature reçue</option>
              <option value="screening">En cours d'évaluation</option>
              <option value="interview">Entretien programmé</option>
              <option value="offer">Offre en cours</option>
              <option value="hired">Recruté</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setFilters({
            experience: '',
            location: '',
            skills: '',
            status: '',
            dateRange: ''
          })}>
            Réinitialiser
          </Button>
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Appliquer les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Composant de notification inspiré des ATS modernes
 */
export const NotificationCard: React.FC<{
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    timestamp: string;
    avatar?: string;
  };
  onDismiss?: () => void;
}> = ({ notification, onDismiss }) => {
  const typeColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    error: 'bg-red-50 border-red-200'
  };

  const typeIcons = {
    success: CheckCircle,
    warning: AlertCircle,
    info: Eye,
    error: XCircle
  };

  const Icon = typeIcons[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-4 rounded-lg border ${typeColors[notification.type]} mb-3`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${
            notification.type === 'success' ? 'text-green-600' :
            notification.type === 'warning' ? 'text-yellow-600' :
            notification.type === 'info' ? 'text-blue-600' :
            'text-red-600'
          }`} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
