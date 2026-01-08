import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Award, 
  Zap, 
  Brain,
  BarChart3,
  PieChart,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Clock,
  Eye,
  Download,
  Share2,
  RotateCcw
} from 'lucide-react';

interface CVComparisonToolProps {
  className?: string;
}

interface CVData {
  id: string;
  name: string;
  fileName: string;
  score: number;
  confidence: number;
  processingTime: number;
  strengths: string[];
  weaknesses: string[];
  skills: {
    technical: string[];
    soft: string[];
  };
  sections: {
    contact: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    languages: boolean;
    certifications: boolean;
  };
  recommendations: string[];
}

export const CVComparisonTool: React.FC<CVComparisonToolProps> = ({ className }) => {
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Mock data pour la démo
  const mockCVs: CVData[] = [
    {
      id: '1',
      name: 'Jean Mabiala',
      fileName: 'CV_Jean_Mabiala.pdf',
      score: 87,
      confidence: 94,
      processingTime: 7,
      strengths: ['Structure claire', 'Expérience pertinente', 'Compétences techniques'],
      weaknesses: ['Manque de certifications', 'Section langues incomplète'],
      skills: {
        technical: ['JavaScript', 'React', 'Node.js', 'Python'],
        soft: ['Leadership', 'Communication', 'Gestion d\'équipe']
      },
      sections: {
        contact: true,
        experience: true,
        education: true,
        skills: true,
        languages: false,
        certifications: false
      },
      recommendations: [
        'Ajouter une section certifications',
        'Compléter les informations de langues',
        'Optimiser les mots-clés techniques'
      ]
    },
    {
      id: '2',
      name: 'Marie Kouba',
      fileName: 'Resume_Marie_Kouba.docx',
      score: 72,
      confidence: 89,
      processingTime: 9,
      strengths: ['Profil complet', 'Certifications', 'Expérience internationale'],
      weaknesses: ['Structure à améliorer', 'Manque de mots-clés'],
      skills: {
        technical: ['Java', 'Spring', 'MySQL', 'Docker'],
        soft: ['Adaptabilité', 'Résolution de problèmes', 'Travail en équipe']
      },
      sections: {
        contact: true,
        experience: true,
        education: true,
        skills: true,
        languages: true,
        certifications: true
      },
      recommendations: [
        'Restructurer le CV',
        'Ajouter plus de mots-clés techniques',
        'Améliorer la mise en page'
      ]
    },
    {
      id: '3',
      name: 'Pierre Nzouba',
      fileName: 'CV_Pierre_Nzouba.pdf',
      score: 65,
      confidence: 82,
      processingTime: 8,
      strengths: ['Expérience diversifiée', 'Formation solide'],
      weaknesses: ['Score ATS faible', 'Structure confuse', 'Manque de cohérence'],
      skills: {
        technical: ['PHP', 'WordPress', 'HTML/CSS', 'JavaScript'],
        soft: ['Créativité', 'Autonomie', 'Persévérance']
      },
      sections: {
        contact: true,
        experience: true,
        education: true,
        skills: false,
        languages: true,
        certifications: false
      },
      recommendations: [
        'Refonte complète du CV',
        'Améliorer la structure',
        'Ajouter une section compétences',
        'Optimiser pour les ATS'
      ]
    }
  ];

  const toggleCVSelection = (cvId: string) => {
    setSelectedCVs(prev => {
      if (prev.includes(cvId)) {
        return prev.filter(id => id !== cvId);
      } else if (prev.length < 3) {
        return [...prev, cvId];
      }
      return prev;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const selectedCVsData = mockCVs.filter(cv => selectedCVs.includes(cv.id));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Comparateur de CV
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comparez jusqu'à 3 CV simultanément pour identifier les meilleures pratiques et optimisations
        </p>
      </div>

      {/* Sélection des CV */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCVs.map((cv, index) => (
          <motion.div
            key={cv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedCVs.includes(cv.id) 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:border-blue-300'
              }`}
              onClick={() => toggleCVSelection(cv.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cv.name}</h3>
                        <p className="text-sm text-gray-600">{cv.fileName}</p>
                      </div>
                    </div>
                    {selectedCVs.includes(cv.id) && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${getScoreColor(cv.score)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getScoreIcon(cv.score)}
                        <span className="font-medium">Score ATS</span>
                      </div>
                      <div className="text-2xl font-bold">{cv.score}</div>
                    </div>
                    <Progress value={cv.score} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-600">Confiance</div>
                      <div className="font-bold text-blue-600">{cv.confidence}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Temps</div>
                      <div className="font-bold text-green-600">{cv.processingTime}ms</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {cv.skills.technical.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {cv.skills.technical.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{cv.skills.technical.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bouton de comparaison */}
      {selectedCVs.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button 
            onClick={() => setShowComparison(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Comparer {selectedCVs.length} CV
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}

      {/* Résultats de comparaison */}
      <AnimatePresence>
        {showComparison && selectedCVsData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Comparaison des scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  Comparaison des Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedCVsData.map((cv, index) => (
                    <div key={cv.id} className="text-center space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{cv.name}</h3>
                        <p className="text-sm text-gray-600">{cv.fileName}</p>
                      </div>
                      
                      <div className={`p-6 rounded-xl border-2 ${getScoreColor(cv.score)}`}>
                        <div className="text-4xl font-bold mb-2">{cv.score}</div>
                        <div className="text-sm text-gray-600">Score ATS</div>
                        <Progress value={cv.score} className="h-3 mt-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-600">Confiance</div>
                          <div className="font-bold text-blue-600">{cv.confidence}%</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-600">Temps</div>
                          <div className="font-bold text-green-600">{cv.processingTime}ms</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparaison des sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <PieChart className="w-6 h-6 text-purple-600" />
                  Comparaison des Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Section</th>
                        {selectedCVsData.map(cv => (
                          <th key={cv.id} className="text-center p-3 font-medium">{cv.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedCVsData[0].sections).map(([section, _]) => (
                        <tr key={section} className="border-b">
                          <td className="p-3 font-medium capitalize">{section}</td>
                          {selectedCVsData.map(cv => (
                            <td key={cv.id} className="text-center p-3">
                              {cv.sections[section as keyof typeof cv.sections] ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Comparaison des compétences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-green-600" />
                    Compétences Techniques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCVsData.map(cv => (
                      <div key={cv.id} className="space-y-2">
                        <div className="font-medium text-sm">{cv.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {cv.skills.technical.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    Soft Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCVsData.map(cv => (
                      <div key={cv.id} className="space-y-2">
                        <div className="font-medium text-sm">{cv.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {cv.skills.soft.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommandations comparatives */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-green-600" />
                  Recommandations Comparatives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {selectedCVsData.map(cv => (
                    <div key={cv.id} className="p-4 bg-white rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {cv.name}
                      </h3>
                      <div className="space-y-2">
                        {cv.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter le rapport
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
              <Button 
                onClick={() => setShowComparison(false)}
                variant="ghost"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Nouvelle comparaison
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
