import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  FileImage, 
  File, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Eye,
  Download,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface ParsedCV {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'jpg' | 'png';
  fileSize: number;
  uploadDate: string;
  parsingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  parsedData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    experience: number;
    education: string[];
    skills: string[];
    languages: string[];
    summary: string;
    matchScore: number;
  };
  originalFile: File;
}

export const CVParsingEngine = () => {
  const [parsedCVs, setParsedCVs] = useState<ParsedCV[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const fileType = file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'docx' | 'jpg' | 'png';
      
      if (!['pdf', 'docx', 'jpg', 'png'].includes(fileType)) {
        toast.error(`Format non supporté: ${file.name}`);
        return;
      }

      const newCV: ParsedCV = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        parsingStatus: 'pending',
        parsedData: {
          name: '',
          email: '',
          phone: '',
          location: '',
          experience: 0,
          education: [],
          skills: [],
          languages: [],
          summary: '',
          matchScore: 0
        },
        originalFile: file
      };

      setParsedCVs(prev => [newCV, ...prev]);
      processCV(newCV);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true
  });

  const processCV = async (cv: ParsedCV) => {
    setIsProcessing(true);
    
    // Simuler le traitement
    setParsedCVs(prev => 
      prev.map(c => 
        c.id === cv.id ? { ...c, parsingStatus: 'processing' as const } : c
      )
    );

    // Simulation du parsing avec IA
    setTimeout(() => {
      const mockParsedData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        phone: '+242 06 12 34 56 78',
        location: 'Brazzaville, Congo',
        experience: 5,
        education: ['Master en Informatique - Université Marien Ngouabi'],
        skills: ['React', 'Node.js', 'Python', 'MongoDB', 'Docker'],
        languages: ['Français', 'Anglais'],
        summary: 'Développeur Full-Stack avec 5 ans d\'expérience...',
        matchScore: Math.floor(Math.random() * 40) + 60 // Score entre 60-100
      };

      setParsedCVs(prev => 
        prev.map(c => 
          c.id === cv.id ? { 
            ...c, 
            parsingStatus: 'completed' as const,
            parsedData: mockParsedData
          } : c
        )
      );
      
      toast.success(`CV ${cv.fileName} analysé avec succès`);
      setIsProcessing(false);
    }, 2000 + Math.random() * 3000); // 2-5 secondes
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
      case 'docx': return <File className="h-6 w-6 text-blue-500" />;
      case 'jpg':
      case 'png': return <FileImage className="h-6 w-6 text-green-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Analysé';
      case 'processing': return 'En cours';
      case 'failed': return 'Échec';
      default: return 'En attente';
    }
  };

  const filteredCVs = parsedCVs.filter(cv => {
    const matchesSearch = cv.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cv.parsedData.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cv.parsingStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteCV = (cvId: string) => {
    setParsedCVs(prev => prev.filter(cv => cv.id !== cvId));
    toast.success('CV supprimé');
  };

  const handleReprocessCV = (cv: ParsedCV) => {
    processCV(cv);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Moteur de Parsing CV</h2>
          <p className="text-gray-600">Analyse intelligente des CV avec IA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un CV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Analysés</option>
            <option value="processing">En cours</option>
            <option value="failed">Échecs</option>
          </select>
        </div>
      </div>

      {/* Zone de drop */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Déposez vos CV ici' : 'Glissez vos CV ici ou cliquez pour sélectionner'}
            </h3>
            <p className="text-gray-600 mb-4">
              Formats supportés: PDF, DOCX, JPG, PNG
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">DOCX</Badge>
              <Badge variant="outline">JPG</Badge>
              <Badge variant="outline">PNG</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des CV traités */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">CV Analysés ({filteredCVs.length})</h3>
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Traitement en cours...
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {filteredCVs.map((cv) => (
            <Card key={cv.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getFileIcon(cv.fileType)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{cv.fileName}</h4>
                        <Badge variant={cv.parsingStatus === 'completed' ? 'default' : 'secondary'}>
                          {getStatusIcon(cv.parsingStatus)}
                          {getStatusText(cv.parsingStatus)}
                        </Badge>
                        {cv.parsingStatus === 'completed' && (
                          <Badge variant="outline" className="text-green-600">
                            <Star className="h-3 w-3 mr-1" />
                            {cv.parsedData.matchScore}% match
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {(cv.fileSize / 1024 / 1024).toFixed(2)} MB • 
                        {new Date(cv.uploadDate).toLocaleDateString()}
                      </div>

                      {cv.parsingStatus === 'completed' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{cv.parsedData.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{cv.parsedData.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{cv.parsedData.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{cv.parsedData.location}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Compétences</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {cv.parsedData.skills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {cv.parsedData.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{cv.parsedData.skills.length - 5} autres
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {cv.parsingStatus === 'processing' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            Analyse en cours...
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {cv.parsingStatus === 'completed' && (
                      <>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {cv.parsingStatus === 'failed' && (
                      <Button size="sm" onClick={() => handleReprocessCV(cv)}>
                        Réessayer
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteCV(cv.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCVs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun CV trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}; 