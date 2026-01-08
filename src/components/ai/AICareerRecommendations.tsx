import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Building,
  Users,
  Target,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIRecommendationService } from '@/services/ai/AIRecommendationService';

interface UserProfile {
  id: string;
  age: number;
  education_level: string;
  location: string;
  interests: string[];
  skills: string[];
  career_goals: string[];
  personality_type?: string;
  test_results?: {
    riasec?: Record<string, number>;
    emotional_intelligence?: number;
    learning_style?: string[];
  };
  work_experience?: {
    years: number;
    sectors: string[];
    positions: string[];
  };
}

interface CareerRecommendation {
  career_path: string;
  match_score: number;
  reasoning: string;
  required_skills: string[];
  training_recommendations: string[];
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  job_market_outlook: string;
  next_steps: string[];
  local_opportunities: {
    companies: string[];
    institutions: string[];
    resources: string[];
  };
}

interface AICareerRecommendationsProps {
  userProfile: UserProfile;
  options?: {
    focus?: 'career_change' | 'first_job' | 'skill_development' | 'entrepreneurship';
    timeframe?: 'immediate' | 'short_term' | 'long_term';
    budget_range?: 'low' | 'medium' | 'high';
  };
  onRecommendationSelect?: (recommendation: CareerRecommendation) => void;
  className?: string;
}

export const AICareerRecommendations: React.FC<AICareerRecommendationsProps> = ({
  userProfile,
  options,
  onRecommendationSelect,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [aiService] = useState(() => new AIRecommendationService());
  const [selectedTimeframe, setSelectedTimeframe] = useState(options?.timeframe || 'short_term');
  const [selectedFocus, setSelectedFocus] = useState(options?.focus || 'career_change');

  // Charger les recommandations
  useEffect(() => {
    loadRecommendations();
  }, [userProfile, selectedTimeframe, selectedFocus]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await aiService.generatePersonalizedRecommendations(
        userProfile,
        {
          focus: selectedFocus,
          timeframe: selectedTimeframe,
          budget_range: options?.budget_range
        }
      );
      setRecommendations(results);
    } catch (err) {
      console.error('Erreur chargement recommandations:', err);
      setError('Impossible de charger les recommandations. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCardExpansion = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('fr-FR');
    return `${formatter.format(min)} - ${formatter.format(max)} ${currency}`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent match';
    if (score >= 60) return 'Bon match';
    return 'Match partiel';
  };

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Génération de vos recommandations</h3>
          <p className="text-gray-600 text-center">
            Notre IA analyse votre profil pour vous proposer les meilleures opportunités de carrière...
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Analyse de vos compétences et intérêts
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Étude du marché de l'emploi congolais
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Génération de recommandations personnalisées
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 mb-4">
            <Brain className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Erreur de génération</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <Button onClick={loadRecommendations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Recommandations IA personnalisées
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Basées sur votre profil et le marché congolais
                </CardDescription>
              </div>
            </div>
            <Button onClick={loadRecommendations} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="immediate">Immédiat</TabsTrigger>
              <TabsTrigger value="short_term">Court terme</TabsTrigger>
              <TabsTrigger value="long_term">Long terme</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="mt-4 flex gap-2 flex-wrap">
            {(['career_change', 'first_job', 'skill_development', 'entrepreneurship'] as const).map((focus) => (
              <Button
                key={focus}
                variant={selectedFocus === focus ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFocus(focus)}
              >
                {focus === 'career_change' && 'Reconversion'}
                {focus === 'first_job' && 'Premier emploi'}
                {focus === 'skill_development' && 'Développement'}
                {focus === 'entrepreneurship' && 'Entrepreneuriat'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <div className="space-y-4">
        <AnimatePresence>
          {recommendations.map((recommendation, index) => {
            const isExpanded = expandedCards.has(index);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{recommendation.career_path}</CardTitle>
                          <Badge 
                            className={`${getMatchScoreColor(recommendation.match_score)} text-white`}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {recommendation.match_score}%
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {getMatchScoreLabel(recommendation.match_score)} pour votre profil
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardExpansion(index)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <Progress value={recommendation.match_score} className="mt-2" />
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Aperçu rapide */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>Congo - {userProfile.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{formatSalary(
                            recommendation.salary_range.min,
                            recommendation.salary_range.max,
                            recommendation.salary_range.currency
                          )}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span>Marché favorable</span>
                        </div>
                      </div>

                      {/* Raison du match */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Brain className="h-4 w-4 text-blue-600" />
                          Pourquoi ce match ?
                        </h4>
                        <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
                      </div>

                      <Collapsible open={isExpanded}>
                        <CollapsibleContent className="space-y-4">
                          <Tabs defaultValue="skills" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="skills">Compétences</TabsTrigger>
                              <TabsTrigger value="training">Formation</TabsTrigger>
                              <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
                              <TabsTrigger value="steps">Étapes</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="skills" className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-2">Compétences requises</h4>
                                <div className="flex flex-wrap gap-2">
                                  {recommendation.required_skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="training" className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Formations recommandées
                                </h4>
                                <ul className="space-y-2">
                                  {recommendation.training_recommendations.map((training, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                      {training}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="opportunities" className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Entreprises
                                  </h4>
                                  <ul className="space-y-1 text-sm">
                                    {recommendation.local_opportunities.companies.map((company, idx) => (
                                      <li key={idx}>{company}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Institutions
                                  </h4>
                                  <ul className="space-y-1 text-sm">
                                    {recommendation.local_opportunities.institutions.map((institution, idx) => (
                                      <li key={idx}>{institution}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Ressources
                                  </h4>
                                  <ul className="space-y-1 text-sm">
                                    {recommendation.local_opportunities.resources.map((resource, idx) => (
                                      <li key={idx}>{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="steps" className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Prochaines étapes
                                </h4>
                                <div className="space-y-3">
                                  {recommendation.next_steps.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                        {idx + 1}
                                      </div>
                                      <p className="text-sm">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => onRecommendationSelect?.(recommendation)}
                          className="flex-1"
                        >
                          Commencer ce parcours
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => toggleCardExpansion(index)}
                        >
                          {isExpanded ? 'Réduire' : 'Voir plus'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer avec informations */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" />
            <span>
              Ces recommandations sont générées par notre IA spécialisée dans le marché congolais.
              Elles sont basées sur votre profil unique et les opportunités locales.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
