import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  Target,
  BookOpen,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Star,
} from 'lucide-react';
import {
  RecommendationEngine,
  Recommendation,
} from '@/services/ats/RecommendationEngine';
import { CandidateProfile, JobRequirements } from '@/services/ats/PredictiveScoringService';
import { MatchResult } from '@/services/ats/IntelligentMatchingService';

interface RecommendationsWidgetProps {
  candidate?: CandidateProfile;
  job?: JobRequirements;
  match?: MatchResult;
  cvScore?: number;
}

/**
 * Widget de recommandations intelligentes
 */
export const RecommendationsWidget: React.FC<RecommendationsWidgetProps> = ({
  candidate,
  job,
  match,
  cvScore,
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredType, setFilteredType] = useState<string | null>(null);
  const recommendationEngine = new RecommendationEngine();

  useEffect(() => {
    if (candidate) {
      const recs = recommendationEngine.generateCandidateRecommendations({
        candidate,
        job,
        match,
        cvScore,
      });
      setRecommendations(recs);
    }
  }, [candidate, job, match, cvScore]);

  if (!candidate) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Sélectionnez un candidat pour voir les recommandations</p>
        </CardContent>
      </Card>
    );
  }

  const filteredRecommendations = filteredType
    ? recommendations.filter(r => r.type === filteredType)
    : recommendations;

  const groupedByPriority = {
    high: filteredRecommendations.filter(r => r.priority === 'high'),
    medium: filteredRecommendations.filter(r => r.priority === 'medium'),
    low: filteredRecommendations.filter(r => r.priority === 'low'),
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Target className="h-4 w-4" />;
      case 'skill':
        return <TrendingUp className="h-4 w-4" />;
      case 'career_path':
        return <ArrowRight className="h-4 w-4" />;
      case 'training':
        return <BookOpen className="h-4 w-4" />;
      case 'action':
        return <Zap className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="flex items-center gap-1">🚨 Prioritaire</Badge>;
      case 'medium':
        return <Badge variant="default" className="flex items-center gap-1">⚡ Important</Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1">💡 Suggestion</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Recommandations Intelligentes</CardTitle>
          </div>
          <Badge variant="outline">{recommendations.length} recommandations</Badge>
        </div>
        <CardDescription>
          Basées sur votre profil et l'analyse ML
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" onClick={() => setFilteredType(null)}>
              Tous ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="job" onClick={() => setFilteredType('job')}>
              Jobs
            </TabsTrigger>
            <TabsTrigger value="skill" onClick={() => setFilteredType('skill')}>
              Compétences
            </TabsTrigger>
            <TabsTrigger value="career" onClick={() => setFilteredType('career_path')}>
              Carrière
            </TabsTrigger>
            <TabsTrigger value="training" onClick={() => setFilteredType('training')}>
              Formation
            </TabsTrigger>
            <TabsTrigger value="action" onClick={() => setFilteredType('action')}>
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filteredType || 'all'} className="mt-4">
            <div className="space-y-4">
              {/* Recommandations prioritaires */}
              {groupedByPriority.high.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Prioritaire ({groupedByPriority.high.length})
                  </h4>
                  <div className="space-y-3">
                    {groupedByPriority.high.map((rec) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 rounded-r-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(rec.type)}
                              <h5 className="font-semibold text-sm">{rec.title}</h5>
                              {getPriorityBadge(rec.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            {rec.estimatedImpact && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                Impact estimé : +{rec.estimatedImpact}% sur votre employabilité
                              </div>
                            )}
                          </div>
                          <Badge variant="outline">{Math.round(rec.confidence)}% confiance</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommandations importantes */}
              {groupedByPriority.medium.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Important ({groupedByPriority.medium.length})
                  </h4>
                  <div className="space-y-3">
                    {groupedByPriority.medium.map((rec) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(rec.type)}
                              <h5 className="font-semibold text-sm">{rec.title}</h5>
                              {getPriorityBadge(rec.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            {rec.estimatedImpact && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                Impact estimé : +{rec.estimatedImpact}%
                              </div>
                            )}
                          </div>
                          <Badge variant="outline">{Math.round(rec.confidence)}%</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {groupedByPriority.low.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Suggestions ({groupedByPriority.low.length})
                  </h4>
                  <div className="space-y-2">
                    {groupedByPriority.low.map((rec) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 flex-1">
                            {getTypeIcon(rec.type)}
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{rec.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{Math.round(rec.confidence)}%</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {filteredRecommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune recommandation pour ce filtre</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

