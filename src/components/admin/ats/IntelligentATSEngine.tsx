import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  FileText, 
  Users, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Target,
  Zap,
  BarChart3,
  FileSearch,
  Lightbulb,
  Settings,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentType {
  type: 'cv' | 'cover_letter' | 'portfolio' | 'certificate' | 'transcript';
  confidence: number;
  structure: string[];
  sections: Record<string, any>;
}

interface IntelligentAnalysis {
  documentType: DocumentType;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    confidence: number;
  };
  professionalProfile: {
    title: string;
    seniority: 'junior' | 'mid' | 'senior' | 'expert';
    industry: string[];
    yearsExperience: number;
    confidence: number;
  };
  skills: {
    technical: Array<{ name: string; level: number; category: string; }>;
    soft: Array<{ name: string; level: number; }>;
    languages: Array<{ name: string; level: string; }>;
    certifications: Array<{ name: string; issuer: string; date: string; }>;
  };
  experience: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
    achievements: string[];
    technologies: string[];
    relevanceScore: number;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    field: string;
    grade?: string;
    relevanceScore: number;
  }>;
  matchingAnalysis: {
    overallScore: number;
    categoryScores: {
      technical: number;
      experience: number;
      education: number;
      cultural: number;
      growth: number;
    };
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  aiInsights: {
    careerTrajectory: string;
    potentialRoles: string[];
    salaryRange: { min: number; max: number; currency: string; };
    riskFactors: string[];
    growthPotential: number;
  };
}

interface JobRequirements {
  title: string;
  level: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experience: number;
  education: string[];
  industry: string;
  location: string;
  salary?: { min: number; max: number; };
}

export const IntelligentATSEngine: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentDocument, setCurrentDocument] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<IntelligentAnalysis | null>(null);
  const [jobRequirements, setJobRequirements] = useState<JobRequirements | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleDocumentUpload = useCallback(async (file: File) => {
    setCurrentDocument(file);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulation d'analyse intelligente étape par étape
      const stages = [
        { name: 'Détection du type de document', progress: 15 },
        { name: 'Extraction intelligente du contenu', progress: 30 },
        { name: 'Analyse sémantique avancée', progress: 50 },
        { name: 'Reconnaissance des entités', progress: 70 },
        { name: 'Scoring et matching', progress: 85 },
        { name: 'Génération des insights IA', progress: 100 }
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalysisProgress(stage.progress);
      }

      // Simulation d'analyse intelligente
      const mockAnalysis: IntelligentAnalysis = {
        documentType: {
          type: 'cv',
          confidence: 0.95,
          structure: ['header', 'summary', 'experience', 'skills', 'education'],
          sections: {}
        },
        personalInfo: {
          name: 'Marie Dubois',
          email: 'marie.dubois@email.com',
          phone: '+33 6 12 34 56 78',
          location: 'Paris, France',
          linkedin: 'linkedin.com/in/marie-dubois',
          confidence: 0.98
        },
        professionalProfile: {
          title: 'Développeuse Full-Stack Senior',
          seniority: 'senior',
          industry: ['Technology', 'Software Development'],
          yearsExperience: 7,
          confidence: 0.92
        },
        skills: {
          technical: [
            { name: 'React', level: 90, category: 'Frontend' },
            { name: 'Node.js', level: 85, category: 'Backend' },
            { name: 'TypeScript', level: 88, category: 'Language' },
            { name: 'PostgreSQL', level: 75, category: 'Database' },
            { name: 'AWS', level: 70, category: 'Cloud' }
          ],
          soft: [
            { name: 'Leadership', level: 85 },
            { name: 'Communication', level: 90 },
            { name: 'Problem Solving', level: 95 }
          ],
          languages: [
            { name: 'Français', level: 'Natif' },
            { name: 'Anglais', level: 'Courant' },
            { name: 'Espagnol', level: 'Intermédiaire' }
          ],
          certifications: [
            { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023' },
            { name: 'React Advanced', issuer: 'Meta', date: '2022' }
          ]
        },
        experience: [
          {
            position: 'Lead Developer',
            company: 'TechCorp',
            duration: '2021-2024',
            description: 'Direction technique d\'une équipe de 5 développeurs',
            achievements: [
              'Augmentation de 40% des performances applicatives',
              'Mise en place de l\'architecture microservices',
              'Formation et mentorat de 3 développeurs junior'
            ],
            technologies: ['React', 'Node.js', 'AWS', 'Docker'],
            relevanceScore: 0.95
          }
        ],
        education: [
          {
            degree: 'Master en Informatique',
            institution: 'École Polytechnique',
            year: '2017',
            field: 'Computer Science',
            grade: 'Mention Très Bien',
            relevanceScore: 0.88
          }
        ],
        matchingAnalysis: {
          overallScore: 87,
          categoryScores: {
            technical: 92,
            experience: 89,
            education: 85,
            cultural: 82,
            growth: 90
          },
          strengths: [
            'Expertise technique solide en stack moderne',
            'Expérience de leadership confirmée',
            'Capacité d\'adaptation et d\'apprentissage'
          ],
          gaps: [
            'Expérience limitée en machine learning',
            'Pas de certification Kubernetes'
          ],
          recommendations: [
            'Formation en IA/ML recommandée',
            'Certification cloud avancée',
            'Projet de migration vers microservices'
          ]
        },
        aiInsights: {
          careerTrajectory: 'Progression naturelle vers des rôles d\'architecture technique ou de management',
          potentialRoles: [
            'Technical Lead',
            'Solutions Architect',
            'Engineering Manager',
            'CTO (startup)'
          ],
          salaryRange: { min: 65000, max: 85000, currency: 'EUR' },
          riskFactors: [
            'Marché très concurrentiel',
            'Évolution technologique rapide'
          ],
          growthPotential: 85
        }
      };

      setAnalysis(mockAnalysis);
      setActiveTab('analysis');

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const ScoreCard = ({ title, score, color }: { title: string; score: number; color: string }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          <Badge variant="outline" className={`${color} text-white`}>
            {score}%
          </Badge>
        </div>
        <Progress value={score} className="h-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">ATS Intelligent</h1>
            <p className="text-gray-600">Analyse avancée par Intelligence Artificielle</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: <Eye className="w-5 h-5" />, label: 'Reconnaissance Avancée', desc: 'Types de documents' },
            { icon: <Brain className="w-5 h-5" />, label: 'IA Sémantique', desc: 'Analyse contextuelle' },
            { icon: <Target className="w-5 h-5" />, label: 'Matching Précis', desc: 'Score multi-critères' },
            { icon: <Lightbulb className="w-5 h-5" />, label: 'Insights Prédictifs', desc: 'Recommandations IA' }
          ].map((feature, index) => (
            <Card key={index} className="border-0 bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="p-4 text-center">
                <div className="text-blue-600 flex justify-center mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-sm">{feature.label}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload & Analyse
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Analyse IA
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Matching
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="w-5 h-5" />
                Analyse Intelligente de Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Analyse en cours...</h3>
                    <Progress value={analysisProgress} className="max-w-md mx-auto" />
                    <p className="text-sm text-gray-600 mt-2">{analysisProgress}% complété</p>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Glissez votre document ici</h3>
                  <p className="text-gray-600 mb-4">
                    CV, lettre de motivation, portfolio, certificats...
                    <br />
                    <span className="text-sm">PDF, Word, Images - Jusqu'à 10MB</span>
                  </p>
                  <Button>
                    Sélectionner un fichier
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => e.target.files?.[0] && handleDocumentUpload(e.target.files[0])}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {analysis && (
            <>
              {/* Document Recognition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Reconnaissance du Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Curriculum Vitae détecté</h3>
                      <p className="text-gray-600">
                        Confiance: {Math.round(analysis.documentType.confidence * 100)}% • 
                        Structure: {analysis.documentType.structure.length} sections identifiées
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white ml-auto">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Validé
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Scores Overview */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <ScoreCard 
                  title="Technique" 
                  score={analysis.matchingAnalysis.categoryScores.technical} 
                  color="bg-blue-500" 
                />
                <ScoreCard 
                  title="Expérience" 
                  score={analysis.matchingAnalysis.categoryScores.experience} 
                  color="bg-green-500" 
                />
                <ScoreCard 
                  title="Formation" 
                  score={analysis.matchingAnalysis.categoryScores.education} 
                  color="bg-purple-500" 
                />
                <ScoreCard 
                  title="Culture" 
                  score={analysis.matchingAnalysis.categoryScores.cultural} 
                  color="bg-orange-500" 
                />
                <ScoreCard 
                  title="Potentiel" 
                  score={analysis.matchingAnalysis.categoryScores.growth} 
                  color="bg-pink-500" 
                />
              </div>

              {/* Professional Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Profil Professionnel Détecté</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Informations Générales</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Poste actuel:</span>
                          <span className="font-medium">{analysis.professionalProfile.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Niveau:</span>
                          <Badge variant="secondary">{analysis.professionalProfile.seniority}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expérience:</span>
                          <span className="font-medium">{analysis.professionalProfile.yearsExperience} ans</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Compétences Clés</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills.technical.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.name} ({skill.level}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Matching Tab */}
        <TabsContent value="matching" className="space-y-6">
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Analyse de Correspondance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full text-white text-2xl font-bold mb-4">
                    {analysis.matchingAnalysis.overallScore}%
                  </div>
                  <h3 className="text-xl font-semibold">Score de Correspondance Global</h3>
                  <p className="text-gray-600">Candidat hautement qualifié</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Points Forts
                    </h4>
                    <ul className="space-y-2">
                      {analysis.matchingAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Axes d'Amélioration
                    </h4>
                    <ul className="space-y-2">
                      {analysis.matchingAnalysis.gaps.map((gap, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {analysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Insights Prédictifs IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Trajectoire de Carrière</h4>
                      <p className="text-gray-700 mb-4">{analysis.aiInsights.careerTrajectory}</p>
                      
                      <h4 className="font-semibold mb-3">Rôles Potentiels</h4>
                      <div className="space-y-2">
                        {analysis.aiInsights.potentialRoles.map((role, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Estimation Salariale</h4>
                      <div className="bg-green-50 p-4 rounded-lg mb-4">
                        <div className="text-2xl font-bold text-green-600">
                          {analysis.aiInsights.salaryRange.min.toLocaleString()} - {analysis.aiInsights.salaryRange.max.toLocaleString()} {analysis.aiInsights.salaryRange.currency}
                        </div>
                        <p className="text-sm text-gray-600">Fourchette basée sur le marché actuel</p>
                      </div>
                      
                      <h4 className="font-semibold mb-3">Potentiel de Croissance</h4>
                      <div className="flex items-center gap-3">
                        <Progress value={analysis.aiInsights.growthPotential} className="flex-1" />
                        <span className="font-semibold">{analysis.aiInsights.growthPotential}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommandations Personnalisées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.matchingAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-2">
                          <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentATSEngine;