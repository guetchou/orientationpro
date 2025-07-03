
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileImage, 
  Trash2, 
  Edit, 
  Download,
  Eye,
  Settings,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Palette,
  Crop,
  Monitor,
  Smartphone,
  Globe,
  Home,
  Users,
  FileText,
  Calendar,
  MessageCircle,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'logo' | 'favicon' | 'icon';
  url: string;
  size: number;
  uploadDate: Date;
  category: string;
  tags: string[];
  isActive?: boolean;
  usedIn?: string[];
  dimensions?: { width: number; height: number };
}

interface SiteSection {
  id: string;
  name: string;
  icon: React.ComponentType;
  mediaCount: number;
  lastUpdated: Date;
}

export default function MediaManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('library');

  // Sections du site avec leurs médias
  const siteSections: SiteSection[] = [
    {
      id: 'homepage',
      name: 'Page d\'accueil',
      icon: Home,
      mediaCount: 12,
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: 'about',
      name: 'À propos',
      icon: Users,
      mediaCount: 8,
      lastUpdated: new Date('2024-01-12')
    },
    {
      id: 'blog',
      name: 'Blog',
      icon: FileText,
      mediaCount: 25,
      lastUpdated: new Date('2024-01-10')
    },
    {
      id: 'tests',
      name: 'Tests',
      icon: Target,
      mediaCount: 15,
      lastUpdated: new Date('2024-01-08')
    },
    {
      id: 'resources',
      name: 'Ressources',
      icon: Award,
      mediaCount: 18,
      lastUpdated: new Date('2024-01-05')
    }
  ];

  // Données simulées des médias avec usage détaillé
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      name: 'logo-principal.png',
      type: 'logo',
      url: '/images/carousel/orientation-1.png',
      size: 245760,
      uploadDate: new Date('2024-01-15'),
      category: 'branding',
      tags: ['logo', 'principal', 'brand'],
      isActive: true,
      usedIn: ['header', 'footer', 'favicon'],
      dimensions: { width: 300, height: 100 }
    },
    {
      id: '2',
      name: 'hero-background.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      size: 1048576,
      uploadDate: new Date('2024-01-10'),
      category: 'hero',
      tags: ['background', 'hero', 'accueil'],
      usedIn: ['homepage-hero'],
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: '3',
      name: 'favicon.ico',
      type: 'favicon',
      url: '/favicon.ico',
      size: 4096,
      uploadDate: new Date('2024-01-01'),
      category: 'branding',
      tags: ['favicon', 'icon'],
      isActive: true,
      usedIn: ['site-wide'],
      dimensions: { width: 32, height: 32 }
    },
    {
      id: '4',
      name: 'testimonial-video.mp4',
      type: 'video',
      url: 'https://example.com/video.mp4',
      size: 15728640,
      uploadDate: new Date('2024-01-05'),
      category: 'testimonials',
      tags: ['video', 'témoignage', 'client'],
      usedIn: ['homepage-testimonials'],
      dimensions: { width: 1280, height: 720 }
    }
  ]);

  const categories = [
    { value: 'all', label: 'Tous les médias', count: mediaFiles.length },
    { value: 'branding', label: 'Branding', count: 2 },
    { value: 'hero', label: 'Section Hero', count: 1 },
    { value: 'gallery', label: 'Galerie', count: 0 },
    { value: 'carousel', label: 'Carrousel', count: 0 },
    { value: 'testimonials', label: 'Témoignages', count: 1 },
    { value: 'blog', label: 'Blog', count: 0 },
    { value: 'icons', label: 'Icônes', count: 0 }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    if (files.length > 0) {
      setShowUploadDialog(true);
    }
  };

  const handleUpload = async (files: File[], category: string, tags: string[], usedIn: string[]) => {
    // Simulation d'upload avec détails complets
    const newFiles: MediaFile[] = files.map((file, index) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      return {
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: isVideo ? 'video' : isImage ? 'image' : 'icon',
        url: URL.createObjectURL(file),
        size: file.size,
        uploadDate: new Date(),
        category: category,
        tags: tags,
        usedIn: usedIn,
        dimensions: isImage ? { width: 1920, height: 1080 } : undefined
      };
    });

    setMediaFiles(prev => [...prev, ...newFiles]);
    setShowUploadDialog(false);
    setSelectedFiles([]);

    toast({
      title: "Upload réussi",
      description: `${files.length} fichier(s) uploadé(s) et intégré(s) au site.`
    });
  };

  const handleDelete = (fileId: string) => {
    const file = mediaFiles.find(f => f.id === fileId);
    setMediaFiles(prev => prev.filter(file => file.id !== fileId));
    
    toast({
      title: "Fichier supprimé",
      description: file?.usedIn?.length ? 
        `Attention: ce fichier était utilisé dans ${file.usedIn.join(', ')}` :
        "Le fichier a été supprimé avec succès."
    });
  };

  const handleSetActive = (fileId: string, type: string) => {
    setMediaFiles(prev => prev.map(file => ({
      ...file,
      isActive: file.type === type ? file.id === fileId : file.isActive
    })));
    
    toast({
      title: "Fichier activé",
      description: "Le fichier est maintenant utilisé sur le site."
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'logo': return Star;
      case 'favicon': return Settings;
      case 'icon': return Zap;
      default: return ImageIcon;
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto p-6">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestionnaire de Médias Complet
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez tous les médias de votre site web en un seul endroit
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.ico"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Images</p>
                    <p className="text-2xl font-bold">{mediaFiles.filter(f => f.type === 'image').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Vidéos</p>
                    <p className="text-2xl font-bold">{mediaFiles.filter(f => f.type === 'video').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Logos</p>
                    <p className="text-2xl font-bold">{mediaFiles.filter(f => f.type === 'logo').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Actifs</p>
                    <p className="text-2xl font-bold">{mediaFiles.filter(f => f.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library">Bibliothèque Médias</TabsTrigger>
            <TabsTrigger value="sections">Sections du Site</TabsTrigger>
            <TabsTrigger value="optimization">Optimisation</TabsTrigger>
          </TabsList>

          {/* Onglet Bibliothèque */}
          <TabsContent value="library" className="space-y-6">
            {/* Filtres et recherche */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher des fichiers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label} ({category.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grille des médias */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredFiles.map((file) => {
                const IconComponent = getFileIcon(file.type);
                return (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className={`group hover:shadow-lg transition-all duration-300 ${file.isActive ? 'ring-2 ring-primary' : ''}`}>
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          {file.type === 'video' ? (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <Video className="h-12 w-12 text-gray-400" />
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            </div>
                          )}
                          {file.isActive && (
                            <Badge className="absolute top-2 right-2 bg-green-500">
                              <Star className="h-3 w-3 mr-1" />
                              Actif
                            </Badge>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <IconComponent className="h-3 w-3" />
                              {file.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium truncate" title={file.name}>
                            {file.name}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{file.uploadDate.toLocaleDateString()}</span>
                          </div>
                          {file.dimensions && (
                            <div className="text-xs text-gray-500">
                              {file.dimensions.width} × {file.dimensions.height}px
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {file.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {file.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{file.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          {file.usedIn && file.usedIn.length > 0 && (
                            <div className="text-xs text-blue-600">
                              Utilisé dans: {file.usedIn.slice(0, 2).join(', ')}
                              {file.usedIn.length > 2 && ` +${file.usedIn.length - 2}`}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFile(file)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                          {!file.isActive && (
                            <Button
                              size="sm"
                              onClick={() => handleSetActive(file.id, file.type)}
                              className="flex-1"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Activer
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Onglet Sections du Site */}
          <TabsContent value="sections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <Card key={section.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {section.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Médias utilisés</span>
                          <span className="font-medium">{section.mediaCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dernière mise à jour</span>
                          <span className="font-medium">{section.lastUpdated.toLocaleDateString()}</span>
                        </div>
                        <Button className="w-full" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Gérer les médias
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Onglet Optimisation */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Optimisation des Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Format de compression</Label>
                    <Select defaultValue="webp">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webp">WebP (recommandé)</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Qualité de compression</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">0%</span>
                      <input type="range" min="0" max="100" defaultValue="80" className="flex-1" />
                      <span className="text-sm">100%</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Optimiser toutes les images
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Versions Responsives
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Générer automatiquement</Label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="mobile" defaultChecked />
                      <label htmlFor="mobile" className="text-sm">Version mobile (375px)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="tablet" defaultChecked />
                      <label htmlFor="tablet" className="text-sm">Version tablette (768px)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="desktop" defaultChecked />
                      <label htmlFor="desktop" className="text-sm">Version desktop (1920px)</label>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Crop className="h-4 w-4 mr-2" />
                    Générer les versions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog d'upload amélioré */}
        <EnhancedUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          files={selectedFiles}
          onUpload={handleUpload}
          categories={categories}
          siteSections={siteSections}
        />

        {/* Dialog de preview amélioré */}
        <EnhancedPreviewDialog
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      </div>
    </div>
  );
}

// Composant Dialog d'upload amélioré
interface EnhancedUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  onUpload: (files: File[], category: string, tags: string[], usedIn: string[]) => void;
  categories: { value: string; label: string; count: number }[];
  siteSections: SiteSection[];
}

function EnhancedUploadDialog({ open, onOpenChange, files, onUpload, categories, siteSections }: EnhancedUploadDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState('gallery');
  const [tags, setTags] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const handleSubmit = () => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onUpload(files, selectedCategory, tagArray, selectedSections);
    setTags('');
    setSelectedCategory('gallery');
    setSelectedSections([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Télécharger et intégrer des fichiers</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label>Fichiers sélectionnés ({files.length})</Label>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  <FileImage className="h-4 w-4" />
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat.value !== 'all').map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="hero, background, accueil"
              />
            </div>
          </div>

          <div>
            <Label>Utiliser dans les sections</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {siteSections.map(section => {
                const IconComponent = section.icon;
                return (
                  <div key={section.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSections([...selectedSections, section.id]);
                        } else {
                          setSelectedSections(selectedSections.filter(id => id !== section.id));
                        }
                      }}
                    />
                    <label htmlFor={section.id} className="text-sm flex items-center gap-2">
                      <IconComponent className="h-3 w-3" />
                      {section.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Télécharger et intégrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant Dialog de preview amélioré
interface EnhancedPreviewDialogProps {
  file: MediaFile | null;
  onClose: () => void;
}

function EnhancedPreviewDialog({ file, onClose }: EnhancedPreviewDialogProps) {
  if (!file) return null;

  return (
    <Dialog open={!!file} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {file.name}
            {file.isActive && (
              <Badge className="bg-green-500">
                <Star className="h-3 w-3 mr-1" />
                Actif
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-center">
            {file.type === 'video' ? (
              <video
                src={file.url}
                controls
                className="max-w-full max-h-96 rounded-lg"
              />
            ) : (
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-96 rounded-lg object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80';
                }}
              />
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="font-medium">Taille</Label>
              <p className="text-gray-600">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <Label className="font-medium">Dimensions</Label>
              <p className="text-gray-600">
                {file.dimensions ? 
                  `${file.dimensions.width} × ${file.dimensions.height}px` : 
                  'N/A'
                }
              </p>
            </div>
            <div>
              <Label className="font-medium">Date d'upload</Label>
              <p className="text-gray-600">{file.uploadDate.toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="font-medium">Catégorie</Label>
              <p className="text-gray-600">{file.category}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="font-medium">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {file.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {file.usedIn && file.usedIn.length > 0 && (
              <div>
                <Label className="font-medium">Utilisé dans</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {file.usedIn.map(usage => (
                    <Badge key={usage} variant="secondary">
                      {usage}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" className="flex-1">
              <Crop className="h-4 w-4 mr-2" />
              Recadrer
            </Button>
            <Button variant="outline" className="flex-1">
              <Palette className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
