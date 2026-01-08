import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Upload,
  Brain,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Star,
  Zap,
  Download,
  Loader2,
  Eye,
  Edit,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CVAnalysisService } from '@/services/ai/CVAnalysisService';

interface CVAnalysisResult {
  overall_score: number;
  ats_compatibility: number;
  sections_analysis: {
    section: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  keywords_analysis: {
    present_keywords: string[];
    missing_keywords: string[];
    keyword_density: Record<string, number>;
  };
  formatting_feedback: {
    structure_score: number;
    readability_score: number;
    design_feedback: string[];
  };
  improvement_suggestions: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
  }[];
}

interface JobRequirements {
  title: string;
  sector: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  education_requirements: string[];
  location: string;
}

interface AICVAnalyzerProps {
  onAnalysisComplete?: (result: CVAnalysisResult) => void;
  jobRequirements?: JobRequirements;
  className?: string;
}

export const AICVAnalyzer: React.FC<AICVAnalyzerProps> = ({
  onAnalysisComplete,
  jobRequirements,
  className = ''
}) => {
  const [cvText, setCvText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvService] = useState(() => new CVAnalysisService());

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      setError('Veuillez saisir le contenu de votre CV');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await cvService.analyzeCVContent(cvText, jobRequirements);
      setAnalysisResult(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      console.error('Erreur analyse CV:', err);
      setError('Erreur lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Analyseur de CV IA
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
              <CardDescription>
                Analyse approfondie et optimisation ATS par intelligence artificielle
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Zone de saisie */}
      {!analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Votre CV
            </CardTitle>
            <CardDescription>
              Collez le contenu de votre CV ci-dessous pour une analyse complète
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Collez ici le contenu de votre CV..."
              className="min-h-[300px] resize-none"
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {jobRequirements && (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Analyse ciblée pour le poste : <strong>{jobRequirements.title}</strong> 
                  dans le secteur {jobRequirements.sector}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !cvText.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyser avec l'IA
                  </>
                )}
              </Button>
              <Button variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Importer fichier
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  Analyse de la structure et du contenu
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  Vérification de la compatibilité ATS
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  Génération des recommandations
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Résultats d'analyse */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Scores généraux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Scores d'évaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Score général</span>
                      <Badge className={getScoreColor(analysisResult.overall_score)}>
                        {analysisResult.overall_score}%
                      </Badge>
                    </div>
                    <Progress 
                      value={analysisResult.overall_score} 
                      className="h-2"
                      style={{ backgroundColor: getProgressColor(analysisResult.overall_score) }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Compatibilité ATS</span>
                      <Badge className={getScoreColor(analysisResult.ats_compatibility)}>
                        {analysisResult.ats_compatibility}%
                      </Badge>
                    </div>
                    <Progress 
                      value={analysisResult.ats_compatibility} 
                      className="h-2"
                      style={{ backgroundColor: getProgressColor(analysisResult.ats_compatibility) }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analyse détaillée */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="sections" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
                    <TabsTrigger value="formatting">Format</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sections" className="space-y-4">
                    <h3 className="font-semibold">Analyse par section</h3>
                    <div className="space-y-4">
                      {analysisResult.sections_analysis.map((section, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{section.section}</h4>
                              <Badge className={getScoreColor(section.score)}>
                                {section.score}%
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{section.feedback}</p>
                            <div className="space-y-1">
                              {section.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="keywords" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-600">Mots-clés présents</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.keywords_analysis.present_keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="bg-green-50 text-green-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 text-red-600">Mots-clés manquants</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.keywords_analysis.missing_keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="bg-red-50 text-red-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="formatting" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Structure</span>
                          <Badge className={getScoreColor(analysisResult.formatting_feedback.structure_score)}>
                            {analysisResult.formatting_feedback.structure_score}%
                          </Badge>
                        </div>
                        <Progress value={analysisResult.formatting_feedback.structure_score} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Lisibilité</span>
                          <Badge className={getScoreColor(analysisResult.formatting_feedback.readability_score)}>
                            {analysisResult.formatting_feedback.readability_score}%
                          </Badge>
                        </div>
                        <Progress value={analysisResult.formatting_feedback.readability_score} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recommandations de design</h4>
                      <div className="space-y-2">
                        {analysisResult.formatting_feedback.design_feedback.map((feedback, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <Eye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {feedback}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="suggestions" className="space-y-4">
                    <div className="space-y-4">
                      {analysisResult.improvement_suggestions.map((suggestion, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              {getPriorityIcon(suggestion.priority)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{suggestion.category}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.priority === 'high' && 'Priorité haute'}
                                    {suggestion.priority === 'medium' && 'Priorité moyenne'}
                                    {suggestion.priority === 'low' && 'Priorité basse'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{suggestion.suggestion}</p>
                                <p className="text-xs text-gray-500">
                                  <Zap className="h-3 w-3 inline mr-1" />
                                  Impact : {suggestion.impact}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3 flex-wrap">
                  <Button className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Optimiser automatiquement
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger rapport
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAnalysisResult(null);
                      setCvText('');
                    }}
                  >
                    Nouvelle analyse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
