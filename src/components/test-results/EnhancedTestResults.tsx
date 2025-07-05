
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Share2, 
  TrendingUp, 
  Users, 
  Lightbulb,
  Award,
  Target
} from 'lucide-react';

interface TestResultsProps {
  testResults: any;
  testType: string;
}

export const EnhancedTestResults: React.FC<TestResultsProps> = ({ testResults, testType }) => {
  const generateReport = () => {
    // Fonction pour générer un rapport PDF
    console.log('Génération du rapport pour:', testType);
  };

  const shareResults = () => {
    // Fonction pour partager les résultats
    console.log('Partage des résultats');
  };

  // Traitement des résultats selon le type de test
  const processResults = () => {
    if (!testResults || !testResults.results) {
      return {
        scores: [],
        insights: [],
        recommendations: [],
        topStrengths: [],
        confidenceScore: 0
      };
    }

    const results = testResults.results;
    
    // Adapter selon le type de test
    switch (testType.toLowerCase()) {
      case 'riasec':
        return {
          scores: Object.entries(results.scores || {}).map(([key, value]) => ({
            category: key,
            score: value as number,
            description: getRiasecDescription(key)
          })),
          insights: results.aiInsights?.analysis ? [results.aiInsights.analysis] : [],
          recommendations: results.aiInsights?.recommendations || [],
          topStrengths: results.aiInsights?.strengths || [],
          confidenceScore: results.confidenceScore || 75
        };
      
      case 'emotional':
        return {
          scores: Object.entries(results.emotionalQuotient || {}).map(([key, value]) => ({
            category: key,
            score: value as number,
            description: getEmotionalDescription(key)
          })),
          insights: results.insights || [],
          recommendations: results.recommendations || [],
          topStrengths: results.strengths || [],
          confidenceScore: results.overallScore || 75
        };
      
      default:
        return {
          scores: [],
          insights: ['Analyse détaillée de vos résultats en cours de traitement.'],
          recommendations: ['Consultez un conseiller pour approfondir votre analyse.'],
          topStrengths: ['Auto-évaluation', 'Engagement dans le processus'],
          confidenceScore: 75
        };
    }
  };

  const { scores, insights, recommendations, topStrengths, confidenceScore } = processResults();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* En-tête des résultats */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Résultats du test {testType.toUpperCase()}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Test complété le {new Date(testResults.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={generateReport}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
              <Button variant="outline" onClick={shareResults}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Score de confiance</span>
                <span className="text-sm text-gray-600">{confidenceScore}%</span>
              </div>
              <Progress value={confidenceScore} className="h-2" />
            </div>
            <Badge variant={confidenceScore >= 80 ? "default" : "secondary"} className="px-4 py-2">
              {confidenceScore >= 80 ? "Très fiable" : confidenceScore >= 60 ? "Fiable" : "À approfondir"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Onglets des résultats détaillés */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="scores">Scores détaillés</TabsTrigger>
          <TabsTrigger value="insights">Analyses</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Points forts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Vos points forts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topStrengths.map((strength, index) => (
                    <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommandations rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  Actions recommandées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start p-2 bg-blue-50 rounded-lg">
                      <Lightbulb className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scores par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scores.map((score, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{score.category}</span>
                      <span className="text-sm text-gray-600">{score.score}%</span>
                    </div>
                    <Progress value={score.score} className="h-2" />
                    <p className="text-xs text-gray-500">{score.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Analyse approfondie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Recommandations personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start p-3 border rounded-lg">
                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Fonctions utilitaires pour les descriptions
const getRiasecDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    'Realistic': 'Préférence pour les activités pratiques et concrètes',
    'Investigative': 'Goût pour la recherche et l\'analyse',
    'Artistic': 'Créativité et expression artistique',
    'Social': 'Orientation vers l\'aide et le service aux autres',
    'Enterprising': 'Leadership et esprit d\'entreprise',
    'Conventional': 'Organisation et respect des procédures'
  };
  return descriptions[key] || 'Dimension de personnalité professionnelle';
};

const getEmotionalDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    'selfAwareness': 'Conscience de soi et de ses émotions',
    'empathy': 'Capacité à comprendre les autres',
    'socialSkills': 'Compétences relationnelles',
    'motivation': 'Drive personnel et ambition'
  };
  return descriptions[key] || 'Compétence émotionnelle';
};
