import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  FileText,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
} from 'lucide-react';
import { PredictiveScoringService, CandidateProfile, JobRequirements } from '@/services/ats/PredictiveScoringService';
import { IntelligentMatchingService } from '@/services/ats/IntelligentMatchingService';
import { AutomatedPipelineService } from '@/services/ats/AutomatedPipelineService';
import { AIChatAdvisorWidget } from './AIChatAdvisorWidget';
import { RecommendationsWidget } from './RecommendationsWidget';
import { PredictiveAnalysisWidget } from './PredictiveAnalysisWidget';
import { BenchmarkWidget } from './BenchmarkWidget';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AdvancedATSDashboardProps {
  candidates?: CandidateProfile[];
  jobs?: JobRequirements[];
}

export const AdvancedATSDashboard: React.FC<AdvancedATSDashboardProps> = ({
  candidates = [],
  jobs = [],
}) => {
  // Mock data pour les tests si pas de candidats fournis
  const mockCandidates: CandidateProfile[] = candidates.length > 0 ? candidates : [
    {
      id: '1',
      cvScore: 85,
      technicalSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      softSkills: ['Leadership', 'Communication', 'Problem Solving', 'Teamwork'],
      yearsExperience: 5,
      educationLevel: 'Master Informatique',
      certifications: ['AWS Certified Solutions Architect', 'React Developer'],
      languages: ['Français', 'Anglais'],
      location: 'Brazzaville, Congo',
      previousRoles: ['Développeur Senior', 'Lead Developer'],
      achievements: ['Augmentation de 30% des performances', 'Gestion d\'équipe de 5 développeurs'],
      quantifiableResults: 3,
      actionVerbs: 5,
      keywordsDensity: 0.85,
    },
    {
      id: '2',
      cvScore: 72,
      technicalSkills: ['Vue.js', 'Python', 'Django', 'MongoDB'],
      softSkills: ['Communication', 'Adaptability'],
      yearsExperience: 3,
      educationLevel: 'Licence Informatique',
      certifications: [],
      languages: ['Français'],
      location: 'Kinshasa, RD Congo',
      previousRoles: ['Développeur Frontend'],
      achievements: ['Création de 3 applications web'],
      quantifiableResults: 1,
      actionVerbs: 2,
      keywordsDensity: 0.65,
    },
    {
      id: '3',
      cvScore: 90,
      technicalSkills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'GraphQL', 'Kubernetes', 'Docker', 'AWS', 'Terraform'],
      softSkills: ['Leadership', 'Management', 'Communication', 'Problem Solving', 'Innovation'],
      yearsExperience: 8,
      educationLevel: 'Master + Certifications',
      certifications: ['AWS Solutions Architect', 'Kubernetes Administrator', 'Scrum Master'],
      languages: ['Français', 'Anglais', 'Espagnol'],
      location: 'Paris, France',
      previousRoles: ['Tech Lead', 'Architecte Technique', 'Développeur Senior'],
      achievements: ['Scaling de 100k à 1M utilisateurs', 'Réduction de 50% des coûts infrastructure'],
      quantifiableResults: 5,
      actionVerbs: 8,
      keywordsDensity: 0.95,
    },
  ];

  const mockJobs: JobRequirements[] = jobs.length > 0 ? jobs : [
    {
      id: '1',
      title: 'Développeur Full Stack Senior',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      preferredSkills: ['Docker', 'AWS', 'GraphQL'],
      minExperience: 5,
      educationRequirements: ['Master Informatique'],
      certifications: ['AWS Certified'],
      languages: ['Français', 'Anglais'],
      location: 'Brazzaville, Congo',
      remote: true,
    },
  ];

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(mockCandidates[0]);
  const [selectedJob, setSelectedJob] = useState<JobRequirements | null>(mockJobs[0]);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const predictiveScoring = new PredictiveScoringService();
  const intelligentMatching = new IntelligentMatchingService();
  const automatedPipeline = new AutomatedPipelineService();

  // Initialiser avec les données mock au chargement
  useEffect(() => {
    if (mockCandidates.length > 0 && mockJobs.length > 0 && !selectedCandidate && !selectedJob) {
      setSelectedCandidate(mockCandidates[0]);
      setSelectedJob(mockJobs[0]);
    }
  }, []);

  // Calculer les matches quand candidat ou job sélectionné
  useEffect(() => {
    if (selectedCandidate && selectedJob) {
      calculateMatch();
    }
  }, [selectedCandidate, selectedJob]);

  const calculateMatch = async () => {
    if (!selectedCandidate || !selectedJob) return;

    setIsLoading(true);
    
    try {
      // Calcul du score prédictif
      const predictiveScore = predictiveScoring.calculatePredictiveScore(
        selectedCandidate,
        selectedJob
      );

      // Calcul du match intelligent
      const matchResult = intelligentMatching.matchCandidateToJob(
        selectedCandidate,
        selectedJob
      );

      setMatchResults([{
        ...matchResult,
        predictiveScore,
        candidate: selectedCandidate,
        job: selectedJob,
      }]);

      // Simuler un délai pour l'UI
      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      console.error('Error calculating match:', error);
      setIsLoading(false);
    }
  };

  // Mock data pour les graphiques
  const scoreDistribution = [
    { name: '80-100', count: 45, color: '#10b981' },
    { name: '60-79', count: 120, color: '#3b82f6' },
    { name: '40-59', count: 85, color: '#f59e0b' },
    { name: '0-39', count: 30, color: '#ef4444' },
  ];

  const categoryScores = matchResults.length > 0 && matchResults[0].predictiveScore
    ? [
        { category: 'Technique', score: matchResults[0].predictiveScore.categoryScores.technical },
        { category: 'Expérience', score: matchResults[0].predictiveScore.categoryScores.experience },
        { category: 'Éducation', score: matchResults[0].predictiveScore.categoryScores.education },
        { category: 'Soft Skills', score: matchResults[0].predictiveScore.categoryScores.softSkills },
        { category: 'Fit Culturel', score: matchResults[0].predictiveScore.categoryScores.culturalFit },
        { category: 'Potentiel', score: matchResults[0].predictiveScore.categoryScores.growthPotential },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Dashboard ATS Avancé
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyse prédictive et matching intelligent
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="ai-chat">IA Chat 🤖</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Candidats analysés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{candidates.length}</div>
                <p className="text-xs text-muted-foreground">+12% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.5</div>
                <p className="text-xs text-muted-foreground">+3.2 points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taux de match</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84.3%</div>
                <p className="text-xs text-muted-foreground">+5.1% ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution des scores */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matching */}
        <TabsContent value="matching" className="space-y-6">
          {matchResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score prédictif */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Prédictif</CardTitle>
                  <CardDescription>Analyse multi-critères avancée</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Score global</span>
                      <span className="text-2xl font-bold text-primary">
                        {matchResults[0].overallMatch}/100
                      </span>
                    </div>
                    <Progress value={matchResults[0].overallMatch} className="h-2" />
                  </div>

                  {/* Scores par catégorie */}
                  <div className="space-y-3">
                    {categoryScores.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.category}</span>
                          <span className="text-sm font-medium">{item.score}/100</span>
                        </div>
                        <Progress value={item.score} className="h-1" />
                      </div>
                    ))}
                  </div>

                  {/* Probabilités */}
                  {matchResults[0].predictiveScore && (
                    <div className="mt-6 pt-6 border-t space-y-2">
                      <h4 className="font-semibold">Probabilités prédictives</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Succès entretien</span>
                          <div className="font-semibold">
                            {matchResults[0].predictiveScore.probability.interviewSuccess}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Offre d'emploi</span>
                          <div className="font-semibold">
                            {matchResults[0].predictiveScore.probability.jobOffer}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rétention</span>
                          <div className="font-semibold">
                            {matchResults[0].predictiveScore.probability.longTermRetention}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Performance</span>
                          <div className="font-semibold">
                            {matchResults[0].predictiveScore.probability.performance}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommandation */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommandation</CardTitle>
                  <CardDescription>Analyse détaillée du match</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge
                      variant={
                        matchResults[0].recommendation === 'strong_recommend'
                          ? 'default'
                          : matchResults[0].recommendation === 'recommend'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-sm px-3 py-1"
                    >
                      {matchResults[0].recommendation === 'strong_recommend'
                        ? '🏆 Fortement recommandé'
                        : matchResults[0].recommendation === 'recommend'
                        ? '✅ Recommandé'
                        : matchResults[0].recommendation === 'consider'
                        ? '⚙️ À considérer'
                        : '❌ Non recommandé'}
                    </Badge>
                  </div>

                  {/* Raisons du match */}
                  {matchResults[0].matchReasons.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Points forts
                      </h4>
                      <ul className="space-y-1">
                        {matchResults[0].matchReasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Préoccupations */}
                  {matchResults[0].concerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Préoccupations
                      </h4>
                      <ul className="space-y-1">
                        {matchResults[0].concerns.map((concern: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Questions suggérées */}
                  {matchResults[0].suggestedInterviewQuestions && matchResults[0].suggestedInterviewQuestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Questions suggérées</h4>
                      <ul className="space-y-1">
                        {matchResults[0].suggestedInterviewQuestions.slice(0, 3).map((question: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {matchResults.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    Sélectionnez un candidat et un poste pour voir le matching
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Candidat</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedCandidate?.id || ''}
                        onChange={(e) => {
                          const candidate = mockCandidates.find(c => c.id === e.target.value);
                          setSelectedCandidate(candidate || null);
                        }}
                      >
                        <option value="">Sélectionner un candidat...</option>
                        {mockCandidates.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.id} - Score: {c.cvScore}/100
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Poste</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedJob?.id || ''}
                        onChange={(e) => {
                          const job = mockJobs.find(j => j.id === e.target.value);
                          setSelectedJob(job || null);
                        }}
                      >
                        <option value="">Sélectionner un poste...</option>
                        {mockJobs.map(j => (
                          <option key={j.id} value={j.id}>
                            {j.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avancés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics en développement...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline */}
        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Automatisé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pipeline en développement...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA Chat */}
        <TabsContent value="ai-chat" className="space-y-6">
          {/* Sélecteur de candidat */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Candidat</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedCandidate?.id || ''}
                    onChange={(e) => {
                      const candidate = mockCandidates.find(c => c.id === e.target.value);
                      setSelectedCandidate(candidate || null);
                    }}
                  >
                    <option value="">Sélectionner un candidat...</option>
                    {mockCandidates.map(c => (
                      <option key={c.id} value={c.id}>
                        Candidat {c.id} - Score CV: {c.cvScore}/100 - {c.yearsExperience} ans exp.
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Poste</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedJob?.id || ''}
                    onChange={(e) => {
                      const job = mockJobs.find(j => j.id === e.target.value);
                      setSelectedJob(job || null);
                    }}
                  >
                    <option value="">Sélectionner un poste...</option>
                    {mockJobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIChatAdvisorWidget
              candidate={selectedCandidate || undefined}
              cvScore={selectedCandidate?.cvScore || matchResults[0]?.overallMatch}
              onAdviceGenerated={(advice) => {
                console.log('Advice generated:', advice);
              }}
            />
            <div className="space-y-6">
              {selectedCandidate && (
                <>
                  <PredictiveAnalysisWidget
                    candidate={selectedCandidate}
                    job={selectedJob || undefined}
                  />
                  {mockCandidates.length > 1 && (
                    <BenchmarkWidget
                      candidate={selectedCandidate}
                      allCandidates={mockCandidates}
                    />
                  )}
                </>
              )}
              {!selectedCandidate && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Sélectionnez un candidat pour voir l'analyse prédictive et le benchmarking
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Recommandations */}
        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsWidget
            candidate={selectedCandidate || undefined}
            job={selectedJob || undefined}
            match={matchResults[0] || undefined}
            cvScore={selectedCandidate?.cvScore || matchResults[0]?.overallMatch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

