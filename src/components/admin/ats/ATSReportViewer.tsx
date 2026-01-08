import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateATSReportPDF } from '@/lib/pdfGenerator';
import { 
  Trophy, Target, TrendingUp, AlertTriangle, CheckCircle, 
  FileText, Download, Eye, EyeOff, Star, Zap, 
  Phone, Mail, User, Briefcase, GraduationCap, 
  Settings, Languages, Award, Clock, BarChart3
} from 'lucide-react';

interface ATSReportData {
  score: number;
  confidence: number;
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
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
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
  extractedText: string;
}

interface ATSReportViewerProps {
  data: ATSReportData;
  onClose?: () => void;
}

const ATSReportViewer: React.FC<ATSReportViewerProps> = ({ data, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateATSReportPDF(data);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Déterminer la couleur et le niveau basé sur le score
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'EXCELLENT', color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', probability: '85-95%' };
    if (score >= 60) return { level: 'BON POTENTIEL', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', probability: '60-75%' };
    if (score >= 40) return { level: 'À AMÉLIORER', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', probability: '30-45%' };
    return { level: 'REFONTE NÉCESSAIRE', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', probability: '10-25%' };
  };

  const scoreLevel = getScoreLevel(data.score);

  // Calculer le pourcentage de sections complétées
  const completedSections = Object.values(data.sections).filter(Boolean).length;
  const totalSections = Object.keys(data.sections).length;
  const sectionCompletionRate = Math.round((completedSections / totalSections) * 100);

  // Données pour le graphique radar (simulation)
  const radarData = [
    { name: 'Contact', value: data.sections.contact ? 100 : 0 },
    { name: 'Expérience', value: data.sections.experience ? 100 : 0 },
    { name: 'Formation', value: data.sections.education ? 100 : 0 },
    { name: 'Compétences', value: data.sections.skills ? 100 : 0 },
    { name: 'Langues', value: data.sections.languages ? 100 : 0 },
    { name: 'Certifications', value: data.sections.certifications ? 100 : 0 },
  ];

  const sectionIcons = {
    contact: Phone,
    experience: Briefcase,
    education: GraduationCap,
    skills: Settings,
    languages: Languages,
    certifications: Award
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className={`${scoreLevel.bgColor} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                <Trophy className={`h-6 w-6 text-${scoreLevel.color}-600`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rapport d'Analyse ATS</h2>
                <p className="text-gray-600">OrientationPro Congo - Système Intelligent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                title="Afficher/Masquer le texte extrait"
              >
                {showExtractedText ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                title="Télécharger le rapport PDF"
              >
                <Download className={`h-5 w-5 ${isGeneratingPDF ? 'animate-spin' : ''}`} />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="sr-only">Fermer</span>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                { id: 'score', label: 'Score & Analyse', icon: Target },
                { id: 'sections', label: 'Sections CV', icon: FileText },
                { id: 'skills', label: 'Compétences', icon: Star },
                { id: 'action-plan', label: 'Plan d\'Action', icon: Zap },
                { id: 'recommendations', label: 'Recommandations', icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Bouton Export PDF */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleExportPDF}
                  disabled={isGeneratingPDF}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className={`h-4 w-4 ${isGeneratingPDF ? 'animate-spin' : ''}`} />
                  {isGeneratingPDF ? 'Génération PDF...' : 'Exporter en PDF'}
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Vue d'ensemble */}
              {activeSection === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score Principal */}
                    <div className={`${scoreLevel.bgColor} rounded-xl p-6 text-center`}>
                      <div className="relative inline-block">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={`rgb(${scoreLevel.color === 'emerald' ? '16 185 129' : scoreLevel.color === 'blue' ? '59 130 246' : scoreLevel.color === 'orange' ? '249 115 22' : '239 68 68'})`}
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - data.score / 100) }}
                            transition={{ duration: 2, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${scoreLevel.textColor}`}>
                            {data.score}
                          </span>
                        </div>
                      </div>
                      <h3 className={`text-lg font-semibold ${scoreLevel.textColor} mt-2`}>
                        Score ATS
                      </h3>
                      <p className={`text-sm ${scoreLevel.textColor} opacity-80`}>
                        {scoreLevel.level}
                      </p>
                    </div>

                    {/* Probabilité d'entretien */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                      <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-purple-700">
                        Probabilité d'entretien
                      </h3>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {scoreLevel.probability}
                      </p>
                    </div>

                    {/* Sections complétées */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-700">
                        Sections CV
                      </h3>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {completedSections}/{totalSections}
                      </p>
                      <p className="text-sm text-green-600 opacity-80">
                        {sectionCompletionRate}% complété
                      </p>
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  {data.personalInfo.name && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informations détectées
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.personalInfo.name && (
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{data.personalInfo.name}</span>
                          </div>
                        )}
                        {data.personalInfo.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{data.personalInfo.email}</span>
                          </div>
                        )}
                        {data.personalInfo.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{data.personalInfo.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Score & Analyse */}
              {activeSection === 'score' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Analyse Détaillée du Score</h3>
                    
                    {/* Breakdown du score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Répartition par critères</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Sections complètes', value: sectionCompletionRate, color: 'blue' },
                            { label: 'Compétences techniques', value: Math.min(data.skills.technical.length * 10, 100), color: 'green' },
                            { label: 'Soft skills', value: Math.min(data.skills.soft.length * 20, 100), color: 'purple' },
                            { label: 'Présentation', value: data.confidence, color: 'orange' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <motion.div
                                    className={`h-2 rounded-full bg-${item.color}-500`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.2 }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-10">
                                  {item.value}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Points forts détectés</h4>
                        <div className="space-y-2">
                          {data.strengths.slice(0, 5).map((strength, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {strength}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sections CV */}
              {activeSection === 'sections' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Analyse des Sections CV</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(data.sections).map(([key, isPresent]) => {
                      const Icon = sectionIcons[key as keyof typeof sectionIcons];
                      const sectionNames = {
                        contact: 'Informations de contact',
                        experience: 'Expérience professionnelle',
                        education: 'Formation',
                        skills: 'Compétences',
                        languages: 'Langues',
                        certifications: 'Certifications'
                      };
                      
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Object.keys(data.sections).indexOf(key) * 0.1 }}
                          className={`p-4 rounded-lg border-2 ${
                            isPresent 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-6 w-6 ${isPresent ? 'text-green-600' : 'text-red-600'}`} />
                            <div className="flex-1">
                              <h4 className={`font-medium ${isPresent ? 'text-green-800' : 'text-red-800'}`}>
                                {sectionNames[key as keyof typeof sectionNames]}
                              </h4>
                              <p className={`text-sm ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
                                {isPresent ? '✅ Détecté' : '❌ Manquant'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Compétences */}
              {activeSection === 'skills' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Analyse des Compétences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Compétences techniques */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Compétences Techniques ({data.skills.technical.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.technical.map((skill, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </motion.span>
                        ))}
                        {data.skills.technical.length === 0 && (
                          <p className="text-gray-500 text-sm italic">Aucune compétence technique détectée</p>
                        )}
                      </div>
                    </div>

                    {/* Soft skills */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Soft Skills ({data.skills.soft.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.soft.map((skill, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </motion.span>
                        ))}
                        {data.skills.soft.length === 0 && (
                          <p className="text-gray-500 text-sm italic">Aucune soft skill détectée</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Plan d'Action */}
              {activeSection === 'action-plan' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Plan d'Action Prioritaire</h3>
                  
                  <div className="space-y-4">
                    {data.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-red-500' : 
                          index === 1 ? 'bg-orange-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{recommendation}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              index === 0 ? 'bg-red-100 text-red-700' : 
                              index === 1 ? 'bg-orange-100 text-orange-700' : 
                              index === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {index === 0 ? 'URGENT' : index === 1 ? 'IMPORTANT' : index === 2 ? 'MOYEN' : 'OPTIONNEL'}
                            </span>
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {index === 0 ? '1-2 jours' : index === 1 ? '3-5 jours' : '1 semaine'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recommandations */}
              {activeSection === 'recommendations' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Rapport Complet</h3>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {data.feedback}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Texte extrait (collapsible) */}
        {showExtractedText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-gray-50 p-6"
          >
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Texte extrait du CV
            </h4>
            <pre className="text-xs text-gray-600 bg-white p-4 rounded-lg border max-h-40 overflow-auto font-mono">
              {data.extractedText}
            </pre>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ATSReportViewer;