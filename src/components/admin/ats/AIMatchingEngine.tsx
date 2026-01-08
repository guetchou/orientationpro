
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Users, 
  Award,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Search,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface CandidateProfile {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  education: string;
  location: string;
  salary_expectation: number;
  availability: string;
  languages: string[];
  certifications: string[];
  personality_traits: {
    leadership: number;
    teamwork: number;
    creativity: number;
    analytical: number;
    communication: number;
  };
}

interface JobRequirement {
  id: string;
  title: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience: number;
  max_experience: number;
  education_level: string;
  location: string;
  salary_range: [number, number];
  remote_allowed: boolean;
  required_languages: string[];
  personality_fit: {
    leadership: number;
    teamwork: number;
    creativity: number;
    analytical: number;
    communication: number;
  };
}

interface MatchResult {
  candidate_id: string;
  job_id: string;
  overall_score: number;
  skill_match: number;
  experience_match: number;
  education_match: number;
  location_match: number;
  salary_match: number;
  personality_match: number;
  language_match: number;
  availability_match: number;
  confidence_level: 'high' | 'medium' | 'low';
  match_reasons: string[];
  potential_concerns: string[];
  recommendations: string[];
}

interface MLModel {
  id: string;
  name: string;
  type: 'neural_network' | 'random_forest' | 'gradient_boosting' | 'svm';
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  last_trained: Date;
  status: 'active' | 'training' | 'inactive';
}

export const AIMatchingEngine: React.FC = () => {
  const [activeModel, setActiveModel] = useState<string>('neural_network_v2');
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [modelMetrics, setModelMetrics] = useState<MLModel[]>([]);

  // Données simulées pour les modèles ML
  useEffect(() => {
    setModelMetrics([
      {
        id: 'neural_network_v2',
        name: 'Réseau de Neurones Avancé',
        type: 'neural_network',
        accuracy: 0.92,
        precision: 0.89,
        recall: 0.94,
        f1_score: 0.91,
        last_trained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'random_forest_v1',
        name: 'Forêt Aléatoire Optimisée',
        type: 'random_forest',
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.89,
        f1_score: 0.87,
        last_trained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'gradient_boost_v1',
        name: 'Gradient Boosting Pro',
        type: 'gradient_boosting',
        accuracy: 0.90,
        precision: 0.88,
        recall: 0.92,
        f1_score: 0.90,
        last_trained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'training'
      }
    ]);
  }, []);

  // Algorithme de scoring avancé
  const calculateAdvancedScore = (candidate: CandidateProfile, job: JobRequirement): MatchResult => {
    // 1. Score des compétences (30% du score total)
    const requiredSkillsMatch = job.required_skills.filter(skill => 
      candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    ).length / job.required_skills.length;
    
    const preferredSkillsMatch = job.preferred_skills.filter(skill => 
      candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    ).length / Math.max(job.preferred_skills.length, 1);
    
    const skillScore = (requiredSkillsMatch * 0.8 + preferredSkillsMatch * 0.2) * 100;

    // 2. Score d'expérience (20% du score total)
    const experienceScore = candidate.experience >= job.min_experience && 
                           candidate.experience <= job.max_experience ? 100 : 
                           Math.max(0, 100 - Math.abs(candidate.experience - (job.min_experience + job.max_experience) / 2) * 10);

    // 3. Score d'éducation (15% du score total)
    const educationLevels = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'];
    const candidateLevel = educationLevels.indexOf(candidate.education);
    const requiredLevel = educationLevels.indexOf(job.education_level);
    const educationScore = candidateLevel >= requiredLevel ? 100 : Math.max(0, 100 - (requiredLevel - candidateLevel) * 20);

    // 4. Score de localisation (10% du score total)
    const locationScore = candidate.location.toLowerCase() === job.location.toLowerCase() || job.remote_allowed ? 100 : 
                         candidate.location.toLowerCase().includes(job.location.toLowerCase()) ? 80 : 40;

    // 5. Score salarial (10% du score total)
    const salaryScore = candidate.salary_expectation >= job.salary_range[0] && 
                       candidate.salary_expectation <= job.salary_range[1] ? 100 :
                       candidate.salary_expectation < job.salary_range[0] ? 
                       Math.max(0, 100 - (job.salary_range[0] - candidate.salary_expectation) / 1000 * 10) :
                       Math.max(0, 100 - (candidate.salary_expectation - job.salary_range[1]) / 1000 * 15);

    // 6. Score de personnalité (10% du score total)
    const personalityScore = Object.keys(job.personality_fit).reduce((acc, trait) => {
      const diff = Math.abs(candidate.personality_traits[trait as keyof typeof candidate.personality_traits] - 
                           job.personality_fit[trait as keyof typeof job.personality_fit]);
      return acc + (100 - diff * 20);
    }, 0) / Object.keys(job.personality_fit).length;

    // 7. Score des langues (5% du score total)
    const languageScore = job.required_languages.every(lang => 
      candidate.languages.some(cl => cl.toLowerCase().includes(lang.toLowerCase()))
    ) ? 100 : 50;

    // Score global pondéré
    const overallScore = Math.round(
      skillScore * 0.30 +
      experienceScore * 0.20 +
      educationScore * 0.15 +
      locationScore * 0.10 +
      salaryScore * 0.10 +
      personalityScore * 0.10 +
      languageScore * 0.05
    );

    // Niveau de confiance basé sur le score
    const confidenceLevel: 'high' | 'medium' | 'low' = 
      overallScore >= 85 ? 'high' : 
      overallScore >= 70 ? 'medium' : 'low';

    // Génération des raisons et recommandations
    const matchReasons: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    if (skillScore >= 80) matchReasons.push('Excellente correspondance des compétences');
    if (skillScore < 60) concerns.push('Manque de compétences clés');
    
    if (experienceScore >= 90) matchReasons.push('Expérience parfaitement adaptée');
    if (experienceScore < 50) recommendations.push('Prévoir une formation d\'adaptation');

    if (personalityScore >= 80) matchReasons.push('Profil de personnalité compatible');
    if (locationScore < 60) recommendations.push('Discuter des modalités de télétravail');

    return {
      candidate_id: candidate.id,
      job_id: job.id,
      overall_score: overallScore,
      skill_match: Math.round(skillScore),
      experience_match: Math.round(experienceScore),
      education_match: Math.round(educationScore),
      location_match: Math.round(locationScore),
      salary_match: Math.round(salaryScore),
      personality_match: Math.round(personalityScore),
      language_match: Math.round(languageScore),
      availability_match: 100, // Simulé
      confidence_level: confidenceLevel,
      match_reasons: matchReasons,
      potential_concerns: concerns,
      recommendations: recommendations
    };
  };

  const runMatchingAlgorithm = () => {
    setMatchingStatus('running');
    
    // Simulation du processus de matching
    setTimeout(() => {
      // Données simulées pour la démo
      const mockResults: MatchResult[] = [
        {
          candidate_id: '1',
          job_id: 'dev-react',
          overall_score: 92,
          skill_match: 95,
          experience_match: 88,
          education_match: 90,
          location_match: 85,
          salary_match: 95,
          personality_match: 92,
          language_match: 100,
          availability_match: 90,
          confidence_level: 'high',
          match_reasons: ['Excellente maîtrise de React', 'Expérience en équipe agile', 'Profil leadership adapté'],
          potential_concerns: [],
          recommendations: ['Organiser un entretien technique approfondi']
        },
        {
          candidate_id: '2',
          job_id: 'dev-react',
          overall_score: 78,
          skill_match: 72,
          experience_match: 85,
          education_match: 80,
          location_match: 70,
          salary_match: 75,
          personality_match: 85,
          language_match: 90,
          availability_match: 80,
          confidence_level: 'medium',
          match_reasons: ['Bonne expérience générale', 'Compétences transférables'],
          potential_concerns: ['Manque d\'expérience React spécifique'],
          recommendations: ['Prévoir une formation React', 'Évaluer la motivation d\'apprentissage']
        }
      ];
      
      setMatchResults(mockResults);
      setMatchingStatus('completed');
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Matching IA Avancé
        </h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            Modèle: {activeModel}
          </Badge>
          <Button 
            onClick={runMatchingAlgorithm}
            disabled={matchingStatus === 'running'}
            className="flex items-center gap-2"
          >
            {matchingStatus === 'running' ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Lancer l'analyse
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="matching" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="models">Modèles IA</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="space-y-6">
          {/* Configuration du matching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configuration du Matching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Poste à analyser</label>
                  <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev-react">Développeur React Senior</SelectItem>
                      <SelectItem value="dev-python">Développeur Python</SelectItem>
                      <SelectItem value="designer-ui">Designer UI/UX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Modèle IA</label>
                  <Select value={activeModel} onValueChange={setActiveModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neural_network_v2">Réseau de Neurones v2</SelectItem>
                      <SelectItem value="random_forest_v1">Forêt Aléatoire v1</SelectItem>
                      <SelectItem value="gradient_boost_v1">Gradient Boosting v1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Score minimum</label>
                  <Input type="number" placeholder="70" min="0" max="100" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Résultats du matching */}
          {matchingStatus === 'completed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Résultats du Matching</h3>
              {matchResults.map((result, index) => (
                <motion.div
                  key={result.candidate_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(result.overall_score)}`}>
                            {result.overall_score}%
                          </div>
                          <div>
                            <h4 className="font-semibold">Candidat #{result.candidate_id}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {getConfidenceIcon(result.confidence_level)}
                              Confiance: {result.confidence_level}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline">
                          Voir le profil
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>

                      {/* Détail des scores */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{result.skill_match}%</div>
                          <div className="text-xs text-gray-500">Compétences</div>
                          <Progress value={result.skill_match} className="mt-1" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{result.experience_match}%</div>
                          <div className="text-xs text-gray-500">Expérience</div>
                          <Progress value={result.experience_match} className="mt-1" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{result.personality_match}%</div>
                          <div className="text-xs text-gray-500">Personnalité</div>
                          <Progress value={result.personality_match} className="mt-1" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{result.location_match}%</div>
                          <div className="text-xs text-gray-500">Localisation</div>
                          <Progress value={result.location_match} className="mt-1" />
                        </div>
                      </div>

                      {/* Points forts et recommandations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-green-600 mb-2">Points forts</h5>
                          <ul className="space-y-1">
                            {result.match_reasons.map((reason, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-600 mb-2">Recommandations</h5>
                          <ul className="space-y-1">
                            {result.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <Zap className="h-3 w-3 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modelMetrics.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${activeModel === model.id ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                      <Badge variant={model.status === 'active' ? 'default' : model.status === 'training' ? 'secondary' : 'outline'}>
                        {model.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Précision:</span>
                        <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.accuracy * 100} />
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-medium">{(model.precision * 100).toFixed(1)}%</div>
                          <div className="text-gray-500">Précision</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-medium">{(model.recall * 100).toFixed(1)}%</div>
                          <div className="text-gray-500">Rappel</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        Dernière formation: {model.last_trained.toLocaleDateString('fr-FR')}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant={activeModel === model.id ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => setActiveModel(model.id)}
                        >
                          {activeModel === model.id ? 'Actif' : 'Activer'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance des Modèles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={modelMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#3B82F6" name="Précision" />
                    <Bar dataKey="f1_score" fill="#10B981" name="Score F1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistiques Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">847</div>
                    <div className="text-sm text-green-600">Matches réussis</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">89%</div>
                    <div className="text-sm text-blue-600">Taux de précision</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.3s</div>
                    <div className="text-sm text-purple-600">Temps moyen</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Matching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Pondération des critères</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Compétences</label>
                      <div className="w-24">
                        <Input type="number" defaultValue="30" className="text-right" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Expérience</label>
                      <div className="w-24">
                        <Input type="number" defaultValue="20" className="text-right" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Éducation</label>
                      <div className="w-24">
                        <Input type="number" defaultValue="15" className="text-right" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Personnalité</label>
                      <div className="w-24">
                        <Input type="number" defaultValue="10" className="text-right" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Options avancées</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Matching en temps réel</label>
                      <div className="w-12">
                        <Button variant="outline" size="sm">On</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Auto-apprentissage</label>
                      <div className="w-12">
                        <Button variant="outline" size="sm">On</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Notifications automatiques</label>
                      <div className="w-12">
                        <Button variant="outline" size="sm">Off</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
