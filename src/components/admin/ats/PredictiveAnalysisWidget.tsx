import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  PredictiveScoringService,
  CandidateProfile,
  JobRequirements,
  PredictiveScore,
} from '@/services/ats/PredictiveScoringService';

interface PredictiveAnalysisWidgetProps {
  candidate: CandidateProfile;
  job?: JobRequirements;
  onAnalysisComplete?: (analysis: PredictiveScore) => void;
}

/**
 * Widget d'analyse prédictive avancée
 * Affiche le score prédictif ML et les probabilités
 */
export const PredictiveAnalysisWidget: React.FC<PredictiveAnalysisWidgetProps> = ({
  candidate,
  job,
  onAnalysisComplete,
}) => {
  const predictiveScoring = new PredictiveScoringService();
  const [analysis, setAnalysis] = React.useState<PredictiveScore | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (job) {
      setIsLoading(true);
      try {
        const predictiveScore = predictiveScoring.calculatePredictiveScore(candidate, job);
        setAnalysis(predictiveScore);
        if (onAnalysisComplete) {
          onAnalysisComplete(predictiveScore);
        }
      } catch (error) {
        console.error('Error calculating predictive score:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [candidate, job]);

  if (!job) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Sélectionnez un poste pour voir l'analyse prédictive</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Analyse prédictive en cours...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Analyse Prédictive ML
              </CardTitle>
              <CardDescription>Score prédictif basé sur l'intelligence artificielle</CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-3 py-1">
              {analysis.overallScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score global */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score global prédictif</span>
              <span className="text-2xl font-bold text-primary">{analysis.overallScore}</span>
            </div>
            <Progress value={analysis.overallScore} className="h-3" />
          </div>

          {/* Scores par catégorie */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Scores par catégorie</h4>
            {Object.entries(analysis.categoryScores).map(([category, score]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm font-medium">{score}/100</span>
                </div>
                <Progress value={score} className="h-1.5" />
              </div>
            ))}
          </div>

          {/* Probabilités prédictives */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Succès entretien
              </div>
              <div className="text-xl font-bold text-green-600">
                {analysis.probability.interviewSuccess}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Offre d'emploi
              </div>
              <div className="text-xl font-bold text-blue-600">
                {analysis.probability.jobOffer}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Rétention
              </div>
              <div className="text-xl font-bold text-purple-600">
                {analysis.probability.longTermRetention}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Performance
              </div>
              <div className="text-xl font-bold text-orange-600">
                {analysis.probability.performance}%
              </div>
            </div>
          </div>

          {/* Facteurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {analysis.factors.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Points forts
                </h4>
                <ul className="space-y-1">
                  {analysis.factors.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.factors.concerns.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Préoccupations
                </h4>
                <ul className="space-y-1">
                  {analysis.factors.concerns.slice(0, 3).map((concern, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Niveau de confiance */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Niveau de confiance</span>
              <Badge variant={analysis.confidence >= 80 ? 'default' : 'secondary'}>
                {analysis.confidence}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

