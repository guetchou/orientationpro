import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Brain,
  Zap
} from 'lucide-react';

interface CVUploadZoneProps {
  onCandidateCreated: (candidate: any) => void;
}

interface ParsedCVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    linkedIn?: string;
  };
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  languages: string[];
  summary?: string;
}

export const CVUploadZone: React.FC<CVUploadZoneProps> = ({ onCandidateCreated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez télécharger un fichier PDF, Word ou texte.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setParsingProgress(0);
    setParsedData(null);

    try {
      // Simulation du progress d'upload
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload vers l'API locale
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      setUploadProgress(100);
      setParsingProgress(100);

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de l\'analyse du CV');
      }

      setParsedData({
        personalInfo: { name: '', email: '', phone: '' },
        skills: [],
        experience: [],
        education: [],
        languages: [],
        summary: ''
      });
      setConfidence(100);
      setAtsScore(data.ats_score);
      setFeedback(data.feedback);
      setExtractedText(data.extracted_text);

      toast({
        title: "CV analysé avec succès",
        description: data.message,
      });

      // Appeler le callback si besoin
      if (onCandidateCreated) onCandidateCreated(data);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger le fichier. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Dépôt et Analyse de CV</h3>
        <Badge variant="outline" className="px-3 py-1 flex items-center gap-2">
          <Brain className="h-4 w-4" />
          IA + NLP
        </Badge>
      </div>

      {/* Zone de dépôt */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <Upload className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragging ? 'Déposez votre CV ici' : 'Téléchargez un CV'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Formats supportés: PDF, Word, Texte
                </p>
                
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="cv-upload"
                />
                
                <label htmlFor="cv-upload">
                  <Button asChild disabled={isUploading}>
                    <span className="cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </span>
                  </Button>
                </label>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Progress d'upload et parsing */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Upload en cours...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  
                  {uploadProgress === 100 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Analyse IA en cours...</span>
                      </div>
                      <Progress value={parsingProgress} className="w-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats du parsing */}
      <AnimatePresence>
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Analyse terminée
                  <Badge variant="secondary" className="ml-auto">
                    {confidence}% confiance
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informations personnelles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{parsedData.personalInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{parsedData.personalInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{parsedData.personalInfo.phone || 'Non spécifié'}</span>
                    </div>
                    {parsedData.personalInfo.linkedIn && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-blue-600">{parsedData.personalInfo.linkedIn}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compétences */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Compétences détectées ({parsedData.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expérience */}
                {parsedData.experience.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Expérience professionnelle
                    </h4>
                    <div className="space-y-2">
                      {parsedData.experience.slice(0, 3).map((exp, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium">{exp.position}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {exp.company} • {exp.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formation */}
                {parsedData.education.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Formation
                    </h4>
                    <div className="space-y-2">
                      {parsedData.education.map((edu, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium">{edu.degree}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.institution} • {edu.year}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Langues */}
                {parsedData.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Langues</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.languages.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rapport enrichi après analyse */}
      {atsScore !== null && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Rapport d'analyse ATS</h3>
          <div className="mb-2">
            <span className="font-semibold">Score ATS :</span> <span className="text-blue-700 font-bold">{atsScore} / 100</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Feedback :</span> <span className="text-gray-700">{feedback}</span>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold text-blue-600">Voir le texte extrait du CV</summary>
            <pre className="mt-2 p-2 bg-white border rounded text-xs max-h-64 overflow-auto whitespace-pre-wrap">{extractedText}</pre>
          </details>
        </div>
      )}
    </div>
  );
};
