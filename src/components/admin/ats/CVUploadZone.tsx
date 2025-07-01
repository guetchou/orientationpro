
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ParsedCVData {
  full_name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  education: string;
  position: string;
}

interface CVUploadZoneProps {
  onCandidateCreated: (candidate: any) => void;
}

export const CVUploadZone: React.FC<CVUploadZoneProps> = ({ onCandidateCreated }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [manualEntry, setManualEntry] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const parseCV = async (file: File): Promise<ParsedCVData> => {
    // Simulation du parsing - à remplacer par l'edge function
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      full_name: "Jean Dupont",
      email: "jean.dupont@email.com",
      phone: "+33 6 12 34 56 78",
      experience: "5 ans d'expérience en développement web avec React et Node.js",
      skills: ["React", "Node.js", "TypeScript", "MongoDB"],
      education: "Master en Informatique - Université Paris",
      position: "Développeur Full Stack"
    };
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const createCandidate = async (cvData: ParsedCVData, resumeUrl: string) => {
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        full_name: cvData.full_name,
        email: cvData.email,
        phone: cvData.phone,
        position: cvData.position,
        experience: cvData.experience,
        motivation: "Candidature via upload CV",
        resume_url: resumeUrl,
        status: 'new',
        rating: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: "Le fichier est trop volumineux (max 10MB)",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.includes('pdf') && !file.type.includes('word')) {
      toast({
        title: "Format non supporté",
        description: "Seuls les fichiers PDF et Word sont acceptés",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Étape 1: Upload du fichier
      setUploadProgress(25);
      const resumeUrl = await uploadFileToStorage(file);
      
      // Étape 2: Parsing du CV
      setUploadProgress(50);
      const cvData = await parseCV(file);
      setParsedData(cvData);
      
      // Étape 3: Création du candidat
      setUploadProgress(75);
      const candidate = await createCandidate(cvData, resumeUrl);
      
      setUploadProgress(100);
      
      toast({
        title: "Succès",
        description: `CV de ${cvData.full_name} analysé et candidat créé`,
      });

      onCandidateCreated(candidate);
      setParsedData(null);
      
    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le CV",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Dépôt de CV Intelligent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {!isUploading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`relative p-8 rounded-lg transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-primary/10 border-primary border-2' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-2'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Glissez-déposez vos CV ici
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Formats supportés: PDF, Word • Max 10MB
                    </p>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => document.getElementById('cv-upload')?.click()}
                      className="relative"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setManualEntry(true)}
                    >
                      Saisie manuelle
                    </Button>
                  </div>
                  
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 p-8"
              >
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analyse en cours...</h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress < 25 && "Upload du fichier..."}
                    {uploadProgress >= 25 && uploadProgress < 50 && "Extraction des données..."}
                    {uploadProgress >= 50 && uploadProgress < 75 && "Analyse des compétences..."}
                    {uploadProgress >= 75 && uploadProgress < 100 && "Création du profil candidat..."}
                    {uploadProgress === 100 && "Terminé !"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Aperçu des données parsées */}
      <AnimatePresence>
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Données extraites du CV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom complet</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{parsedData.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{parsedData.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{parsedData.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Poste ciblé</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{parsedData.position}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Compétences identifiées</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {parsedData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
