
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(100);
      
      // Convertir le fichier en base64 pour l'API de parsing
      const fileContent = await fileToBase64(file);
      
      // Parsing avec l'API NLP
      await parseCV(fileContent, file.name, file.type, fileName);

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

  const parseCV = async (fileContent: string, fileName: string, fileType: string, storedFileName: string) => {
    try {
      // Simulation du progress de parsing
      const parsingInterval = setInterval(() => {
        setParsingProgress(prev => {
          if (prev >= 90) {
            clearInterval(parsingInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      console.log('Calling CV parser API...');
      
      const { data, error } = await supabase.functions.invoke('cv-parser', {
        body: {
          fileContent,
          fileName,
          fileType
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Parsing failed');
      }

      setParsingProgress(100);
      setParsedData(data.data);
      setConfidence(data.metadata.confidence);

      // Créer automatiquement le candidat
      await createCandidateFromParsedData(data.data, storedFileName);

      toast({
        title: "CV analysé avec succès",
        description: `Données extraites avec ${data.metadata.confidence}% de confiance`,
      });

    } catch (error) {
      console.error('Error parsing CV:', error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser le CV. Parsing manuel requis.",
        variant: "destructive"
      });
    }
  };

  const createCandidateFromParsedData = async (data: ParsedCVData, resumeFileName: string) => {
    try {
      const { data: resumeUrl } = supabase.storage
        .from('resumes')
        .getPublicUrl(resumeFileName);

      const candidateData = {
        full_name: data.personalInfo.name,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone || '',
        position: data.experience[0]?.position || 'Poste non spécifié',
        resume_url: resumeUrl.publicUrl,
        motivation: data.summary || 'Motivation extraite automatiquement',
        experience: data.experience.map(exp => 
          `${exp.position} chez ${exp.company} (${exp.duration})`
        ).join('; ') || 'Expérience non spécifiée',
        status: 'new',
        rating: Math.min(Math.max(Math.round(confidence / 20), 1), 5),
        notes: `CV parsé automatiquement. Compétences détectées: ${data.skills.join(', ')}`
      };

      const { data: newCandidate, error } = await supabase
        .from('candidates')
        .insert([candidateData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      onCandidateCreated(newCandidate);
      
      toast({
        title: "Candidat créé",
        description: "Le candidat a été ajouté automatiquement à la base de données",
      });

    } catch (error) {
      console.error('Error creating candidate:', error);
      toast({
        title: "Erreur de création",
        description: "Impossible de créer le candidat. Veuillez le faire manuellement.",
        variant: "destructive"
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Retirer le préfixe data:
      };
      reader.onerror = error => reject(error);
    });
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
    </div>
  );
};
