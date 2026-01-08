import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CareerDNAService, CareerDNA, CareerCompatibility } from '@/services/career-genetics/CareerDNAService';
import { 
  DNA, 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Clock,
  Star,
  Zap,
  Heart,
  Shield,
  Award,
  Users,
  BarChart3,
  Sparkles,
  Loader2
} from 'lucide-react';

interface CareerDNAAnalyzerProps {
  userId: string;
}

export const CareerDNAAnalyzer: React.FC<CareerDNAAnalyzerProps> = ({ userId }) => {
  const [careerDNA, setCareerDNA] = useState<CareerDNA | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const careerDNAService = new CareerDNAService();

  useEffect(() => {
    loadExistingDNA();
  }, [userId]);

  const loadExistingDNA = async () => {
    try {
      setIsLoading(true);
      const existingDNA = await careerDNAService.getCareerDNA(userId);
      setCareerDNA(existingDNA);
    } catch (error) {
      console.error('Erreur chargement ADN:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCareerDNA = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Génération de votre ADN Carrière",
        description: "Analyse en cours de vos tests d'orientation...",
      });
      
      const newDNA = await careerDNAService.generateCareerDNA(userId);
      setCareerDNA(newDNA);
      
      toast({
        title: "ADN Carrière généré avec succès !",
        description: `Analyse complète avec ${newDNA.confidence_score}% de confiance.`,
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer votre ADN Carrière.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 55) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCareerName = (career: string) => {
    return career.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!careerDNA) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
            <DNA className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Découvrez Votre ADN Carrière
          </CardTitle>
          <p className="text-gray-600">
            Une analyse révolutionnaire de votre personnalité professionnelle basée sur vos tests d'orientation
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Brain className="h-4 w-4 mr-1" />
                99% de précision
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                20+ carrières analysées
              </div>
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                IA prédictive avancée
              </div>
            </div>
          </div>
          
          <Button 
            onClick={generateCareerDNA}
            disabled={isGenerating}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <DNA className="mr-2 h-5 w-5" />
                Générer Mon ADN Carrière
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Trier les carrières par compatibilité
  const sortedCareers = Object.entries(careerDNA.compatibility_matrix)
    .sort((a, b) => b[1].natural_fit_score - a[1].natural_fit_score)
    .slice(0, 10); // Top 10

  const topCareer = sortedCareers[0];

  return (
    <div className="space-y-6">
      {/* En-tête avec score de confiance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
          <DNA className="h-10 w-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Votre ADN Carrière
        </h1>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Star className="h-4 w-4 mr-1" />
            Confiance: <span className={getConfidenceColor(careerDNA.confidence_score)}>
              {careerDNA.confidence_score}%
            </span>
          </Badge>
          <Badge variant="outline" className="text-sm">
            Généré le {new Date(careerDNA.generated_at).toLocaleDateString('fr-FR')}
          </Badge>
        </div>
      </motion.div>

      {/* Carrière principale recommandée */}
      {topCareer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-blue/5">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Award className="h-6 w-6 mr-2 text-primary" />
                Carrière Principale Recommandée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-primary">
                    {formatCareerName(topCareer[0])}
                  </h3>
                  <Badge className={`text-white ${getCompatibilityColor(topCareer[1].natural_fit_score)}`}>
                    {topCareer[1].natural_fit_score}% compatible
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {topCareer[1].success_probability}%
                    </div>
                    <div className="text-sm text-gray-600">Probabilité de succès</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {topCareer[1].satisfaction_prediction}%
                    </div>
                    <div className="text-sm text-gray-600">Satisfaction prédite</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {topCareer[1].growth_potential}%
                    </div>
                    <div className="text-sm text-gray-600">Potentiel de croissance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {100 - topCareer[1].stress_level_prediction}%
                    </div>
                    <div className="text-sm text-gray-600">Bien-être au travail</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Timeline de Succès
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Court terme:</strong> {topCareer[1].success_timeline.short_term}</div>
                    <div><strong>Moyen terme:</strong> {topCareer[1].success_timeline.medium_term}</div>
                    <div><strong>Long terme:</strong> {topCareer[1].success_timeline.long_term}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Onglets détaillés */}
      <Tabs defaultValue="compatibility" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="compatibility">Compatibilités</TabsTrigger>
          <TabsTrigger value="genome">Génome</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
        </TabsList>

        {/* Onglet Compatibilités */}
        <TabsContent value="compatibility">
          <div className="grid gap-4">
            {sortedCareers.map(([career, compatibility], index) => (
              <motion.div
                key={career}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CareerCompatibilityCard 
                  career={career} 
                  compatibility={compatibility}
                  rank={index + 1}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Génome */}
        <TabsContent value="genome">
          <div className="grid md:grid-cols-2 gap-6">
            <PersonalityGenomeCard genome={careerDNA.personality_genome} />
            <CognitiveStyleCard cognitive={careerDNA.personality_genome.cognitive_style} />
            <WorkPreferencesCard preferences={careerDNA.personality_genome.work_preferences} />
            <StressResilienceCard resilience={careerDNA.personality_genome.stress_resilience} />
          </div>
        </TabsContent>

        {/* Onglet Prédictions */}
        <TabsContent value="predictions">
          <div className="grid gap-6">
            <SalaryPredictionsCard predictions={careerDNA.predictive_insights.salary_predictions} />
            <JobMarketPositioningCard positioning={careerDNA.predictive_insights.job_market_positioning} />
            <RiskFactorsCard risks={careerDNA.predictive_insights.risk_factors} />
          </div>
        </TabsContent>

        {/* Onglet Évolution */}
        <TabsContent value="evolution">
          <div className="grid gap-6">
            <EvolutionTrackingCard evolution={careerDNA.evolution_tracking} />
            <GrowthTrajectoryCard trajectories={careerDNA.evolution_tracking.growth_trajectory} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Bouton de régénération */}
      <div className="text-center pt-6">
        <Button 
          variant="outline" 
          onClick={generateCareerDNA}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <DNA className="mr-2 h-4 w-4" />
          )}
          Régénérer l'ADN Carrière
        </Button>
      </div>
    </div>
  );
};

// Composants auxiliaires
const CareerCompatibilityCard: React.FC<{
  career: string;
  compatibility: CareerCompatibility;
  rank: number;
}> = ({ career, compatibility, rank }) => {
  const formatCareerName = (career: string) => {
    return career.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 55) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className={`${rank <= 3 ? 'border-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant={rank <= 3 ? "default" : "secondary"}>
              #{rank}
            </Badge>
            <h3 className="font-semibold">{formatCareerName(career)}</h3>
          </div>
          <Badge className={`text-white ${getCompatibilityColor(compatibility.natural_fit_score)}`}>
            {compatibility.natural_fit_score}%
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
          <div>
            <div className="text-gray-600">Succès</div>
            <div className="font-semibold">{compatibility.success_probability}%</div>
          </div>
          <div>
            <div className="text-gray-600">Satisfaction</div>
            <div className="font-semibold">{compatibility.satisfaction_prediction}%</div>
          </div>
          <div>
            <div className="text-gray-600">Croissance</div>
            <div className="font-semibold">{compatibility.growth_potential}%</div>
          </div>
          <div>
            <div className="text-gray-600">Bien-être</div>
            <div className="font-semibold">{100 - compatibility.stress_level_prediction}%</div>
          </div>
        </div>

        {compatibility.recommended_preparation.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-1 flex items-center">
              <Lightbulb className="h-3 w-3 mr-1" />
              Recommandations
            </h4>
            <div className="flex flex-wrap gap-1">
              {compatibility.recommended_preparation.slice(0, 3).map((rec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {rec}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PersonalityGenomeCard: React.FC<{ genome: any }> = ({ genome }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Brain className="h-5 w-5 mr-2" />
        Profil RIASEC
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {Object.entries(genome.riasec_profile).map(([trait, score]) => (
        <div key={trait}>
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize">{trait}</span>
            <span>{score}%</span>
          </div>
          <Progress value={score as number} className="h-2" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const CognitiveStyleCard: React.FC<{ cognitive: any }> = ({ cognitive }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Zap className="h-5 w-5 mr-2" />
        Style Cognitif
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {Object.entries(cognitive).map(([trait, score]) => (
        <div key={trait}>
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
            <span>{score}%</span>
          </div>
          <Progress value={score as number} className="h-2" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const WorkPreferencesCard: React.FC<{ preferences: any }> = ({ preferences }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Users className="h-5 w-5 mr-2" />
        Préférences de Travail
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {Object.entries(preferences).map(([trait, score]) => (
        <div key={trait}>
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
            <span>{score}%</span>
          </div>
          <Progress value={score as number} className="h-2" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const StressResilienceCard: React.FC<{ resilience: any }> = ({ resilience }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        Résilience au Stress
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {Object.entries(resilience).map(([trait, score]) => (
        <div key={trait}>
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
            <span>{score}%</span>
          </div>
          <Progress value={score as number} className="h-2" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const SalaryPredictionsCard: React.FC<{ predictions: any }> = ({ predictions }) => {
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Prédictions Salariales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {formatSalary(predictions.entry_level)}
            </div>
            <div className="text-sm text-gray-600">Débutant</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {formatSalary(predictions.mid_career)}
            </div>
            <div className="text-sm text-gray-600">Intermédiaire</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {formatSalary(predictions.senior_level)}
            </div>
            <div className="text-sm text-gray-600">Senior</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {formatSalary(predictions.peak_earning)}
            </div>
            <div className="text-sm text-gray-600">Maximum</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const JobMarketPositioningCard: React.FC<{ positioning: any }> = ({ positioning }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <BarChart3 className="h-5 w-5 mr-2" />
        Positionnement Marché
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Compétitivité Actuelle</div>
          <div className="text-2xl font-bold">{positioning.current_competitiveness}%</div>
          <Progress value={positioning.current_competitiveness} className="h-2 mt-1" />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Demande Projetée</div>
          <div className="text-2xl font-bold text-green-600">{positioning.projected_demand}%</div>
          <Progress value={positioning.projected_demand} className="h-2 mt-1" />
        </div>
      </div>
      
      {positioning.differentiation_factors.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Facteurs de Différentiation</h4>
          <div className="flex flex-wrap gap-2">
            {positioning.differentiation_factors.map((factor: string, index: number) => (
              <Badge key={index} variant="secondary">
                {factor}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const RiskFactorsCard: React.FC<{ risks: any }> = ({ risks }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Facteurs de Risque
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Automatisation</div>
          <div className="text-lg font-bold text-red-600">{risks.automation_risk}%</div>
          <Progress value={risks.automation_risk} className="h-2 mt-1" />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Volatilité</div>
          <div className="text-lg font-bold text-yellow-600">{risks.market_volatility}%</div>
          <Progress value={risks.market_volatility} className="h-2 mt-1" />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Obsolescence</div>
          <div className="text-lg font-bold text-orange-600">{risks.skill_obsolescence}%</div>
          <Progress value={risks.skill_obsolescence} className="h-2 mt-1" />
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Stratégies de Mitigation</h4>
        <div className="space-y-1">
          {risks.mitigation_strategies.map((strategy: string, index: number) => (
            <div key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              {strategy}
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const EvolutionTrackingCard: React.FC<{ evolution: any }> = ({ evolution }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Heart className="h-5 w-5 mr-2" />
        Suivi d'Évolution
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {evolution.personality_stability_index}%
          </div>
          <div className="text-sm text-gray-600">Stabilité</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {evolution.adaptation_capacity}%
          </div>
          <div className="text-sm text-gray-600">Adaptation</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {evolution.learning_velocity}%
          </div>
          <div className="text-sm text-gray-600">Apprentissage</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {evolution.career_readiness_score}%
          </div>
          <div className="text-sm text-gray-600">Maturité</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const GrowthTrajectoryCard: React.FC<{ trajectories: any[] }> = ({ trajectories }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Trajectoires de Croissance
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {trajectories.map((trajectory, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">{trajectory.trait}</h4>
            <Badge variant="outline">
              {trajectory.development_timeline} mois
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Actuel: {trajectory.current_level}%</span>
              <span>Objectif: {trajectory.projected_level}%</span>
            </div>
            <Progress 
              value={trajectory.current_level} 
              className="h-2"
            />
            
            <div className="mt-3">
              <h5 className="text-sm font-medium mb-1">Actions Recommandées:</h5>
              <div className="space-y-1">
                {trajectory.recommended_actions.map((action: string, actionIndex: number) => (
                  <div key={actionIndex} className="text-xs text-gray-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default CareerDNAAnalyzer;
