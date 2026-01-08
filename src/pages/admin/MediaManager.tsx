
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Settings, 
  Eye, 
  EyeOff, 
  Download, 
  Trash2, 
  Edit,
  Search,
  Filter,
  BarChart3,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Camera,
  Film,
  FileImage,
  Music,
  Archive
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: string;
  tags: string[];
  isActive: boolean;
  siteSection: string;
  optimized: boolean;
  responsive: boolean;
  uploadedAt: Date;
  lastModified: Date;
}

interface SiteStats {
  totalFiles: number;
  totalSize: number;
  activeFiles: number;
  optimizedFiles: number;
  responsiveFiles: number;
  categoryCounts: Record<string, number>;
}

export default function MediaManager() {
  const { user } = useAuth();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    totalFiles: 0,
    totalSize: 0,
    activeFiles: 0,
    optimizedFiles: 0,
    responsiveFiles: 0,
    categoryCounts: {}
  });

  const categories = [
    'images', 'videos', 'logos', 'icons', 'documents', 
    'audio', 'favicons', 'thumbnails', 'backgrounds'
  ];

  const siteSections = [
    'header', 'footer', 'home', 'about', 'services', 
    'blog', 'contact', 'admin', 'ats', 'dashboard'
  ];

  useEffect(() => {
    loadFiles();
    calculateStats();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des fichiers depuis Supabase Storage
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          name: 'logo-principal.png',
          type: 'image/png',
          size: 45000,
          url: '/placeholder.svg',
          category: 'logos',
          tags: ['logo', 'principal', 'header'],
          isActive: true,
          siteSection: 'header',
          optimized: true,
          responsive: true,
          uploadedAt: new Date(),
          lastModified: new Date()
        },
        {
          id: '2',
          name: 'hero-banner.jpg',
          type: 'image/jpeg',
          size: 180000,
          url: '/placeholder.svg',
          category: 'images',
          tags: ['hero', 'banner', 'home'],
          isActive: true,
          siteSection: 'home',
          optimized: false,
          responsive: true,
          uploadedAt: new Date(),
          lastModified: new Date()
        }
      ];
      setFiles(mockFiles);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats: SiteStats = {
      totalFiles: files.length,
      totalSize: files.reduce((acc, file) => acc + file.size, 0),
      activeFiles: files.filter(f => f.isActive).length,
      optimizedFiles: files.filter(f => f.optimized).length,
      responsiveFiles: files.filter(f => f.responsive).length,
      categoryCounts: {}
    };

    categories.forEach(cat => {
      stats.categoryCounts[cat] = files.filter(f => f.category === cat).length;
    });

    setSiteStats(stats);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simuler l'upload vers Supabase Storage
        const { data, error } = await supabase.storage
          .from('resumes')
          .upload(`media/${file.name}`, file);

        if (error) throw error;

        // Mettre à jour le progrès
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast.success(`${selectedFiles.length} fichier(s) uploadé(s) avec succès`);
      await loadFiles();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload des fichiers');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const toggleFileStatus = (fileId: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, isActive: !file.isActive } : file
      )
    );
    toast.success('Statut du fichier mis à jour');
  };

  const deleteFile = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      // Supprimer de Supabase Storage
      const { error } = await supabase.storage
        .from('resumes')
        .remove([`media/${file.name}`]);

      if (error) throw error;

      setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
      toast.success('Fichier supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du fichier');
    }
  };

  const optimizeFile = async (fileId: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, optimized: true } : file
      )
    );
    toast.success('Fichier optimisé avec succès');
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSection = selectedSection === 'all' || file.siteSection === selectedSection;
    
    return matchesSearch && matchesCategory && matchesSection;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Film className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto p-6">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestionnaire de Médias
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez tous les médias de votre site web
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              {siteStats.totalFiles} fichiers
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {formatFileSize(siteStats.totalSize)}
            </Badge>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{siteStats.totalFiles}</p>
                </div>
                <Archive />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{siteStats.activeFiles}</p>
                </div>
                <Eye />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Optimisés</p>
                  <p className="text-2xl font-bold text-blue-600">{siteStats.optimizedFiles}</p>
                </div>
                <Zap />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Responsifs</p>
                  <p className="text-2xl font-bold text-purple-600">{siteStats.responsiveFiles}</p>
                </div>
                <Smartphone />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taille</p>
                  <p className="text-lg font-bold">{formatFileSize(siteStats.totalSize)}</p>
                </div>
                <BarChart3 />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
            <TabsTrigger value="sections">Sections Site</TabsTrigger>
            <TabsTrigger value="optimization">Optimisation</TabsTrigger>
          </TabsList>

          {/* Onglet Bibliothèque */}
          <TabsContent value="library" className="space-y-6">
            {/* Zone d'upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload de Fichiers
                </CardTitle>
                <CardDescription>
                  Glissez-déposez vos fichiers ou cliquez pour les sélectionner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Cliquez pour upload ou glissez-déposez
                    </p>
                    <p className="text-sm text-gray-500">
                      Images, vidéos, documents (Max 10MB par fichier)
                    </p>
                  </label>
                </div>
                
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Upload en cours...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filtres et recherche */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher par nom ou tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sections</SelectItem>
                      {siteSections.map(section => (
                        <SelectItem key={section} value={section}>
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Liste des fichiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant={file.isActive ? "default" : "secondary"}>
                          {file.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <Badge variant="outline">
                            +{file.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          {file.optimized && (
                            <Badge variant="secondary">
                              <Zap className="h-3 w-3 mr-1" />
                              Opt
                            </Badge>
                          )}
                          {file.responsive && (
                            <Badge variant="secondary">
                              <Smartphone className="h-3 w-3 mr-1" />
                              Resp
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFileStatus(file.id)}
                          >
                            {file.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Sections Site */}
          <TabsContent value="sections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteSections.map(section => {
                const sectionFiles = files.filter(f => f.siteSection === section);
                return (
                  <Card key={section}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{section}</span>
                        <Badge variant="outline">
                          {sectionFiles.length} fichiers
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {sectionFiles.slice(0, 3).map(file => (
                          <div key={file.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            {getFileIcon(file.type)}
                            <span className="text-sm truncate flex-1">{file.name}</span>
                            <Badge variant={file.isActive ? "default" : "secondary"}>
                              {file.isActive ? "On" : "Off"}
                            </Badge>
                          </div>
                        ))}
                        {sectionFiles.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{sectionFiles.length - 3} autres fichiers
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Onglet Optimisation */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap />
                    Optimisation Automatique
                  </CardTitle>
                  <CardDescription>
                    Optimisez automatiquement vos images pour de meilleures performances
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Qualité de compression</Label>
                    <Select defaultValue="80">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60% (Haute compression)</SelectItem>
                        <SelectItem value="80">80% (Équilibré)</SelectItem>
                        <SelectItem value="90">90% (Haute qualité)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Formats de sortie</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">WebP</Badge>
                      <Badge variant="outline">AVIF</Badge>
                      <Badge variant="outline">JPEG</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Optimiser tous les fichiers
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor />
                    Images Responsives
                  </CardTitle>
                  <CardDescription>
                    Générez automatiquement des versions adaptées aux différents écrans
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tailles d'écran</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="outline">Mobile (480px)</Badge>
                      <Badge variant="outline">Tablet (768px)</Badge>
                      <Badge variant="outline">Desktop (1200px)</Badge>
                      <Badge variant="outline">4K (1920px)</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Générer versions responsives
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Fichiers non optimisés */}
            <Card>
              <CardHeader>
                <CardTitle>Fichiers nécessitant une optimisation</CardTitle>
                <CardDescription>
                  Ces fichiers peuvent être optimisés pour améliorer les performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {files.filter(f => !f.optimized).map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {file.category}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => optimizeFile(file.id)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Optimiser
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
