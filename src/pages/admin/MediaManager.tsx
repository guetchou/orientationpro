
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  Crop
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'logo' | 'favicon';
  url: string;
  size: number;
  uploadDate: Date;
  category: string;
  tags: string[];
  isActive?: boolean;
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

  // Données simulées des médias
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
      isActive: true
    },
    {
      id: '2',
      name: 'hero-background.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      size: 1048576,
      uploadDate: new Date('2024-01-10'),
      category: 'hero',
      tags: ['background', 'hero', 'accueil']
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
      isActive: true
    }
  ]);

  const categories = [
    { value: 'all', label: 'Tous les médias' },
    { value: 'branding', label: 'Branding' },
    { value: 'hero', label: 'Section Hero' },
    { value: 'gallery', label: 'Galerie' },
    { value: 'carousel', label: 'Carrousel' },
    { value: 'testimonials', label: 'Témoignages' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    if (files.length > 0) {
      setShowUploadDialog(true);
    }
  };

  const handleUpload = async (files: File[], category: string, tags: string[]) => {
    // Simulation d'upload
    const newFiles: MediaFile[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file),
      size: file.size,
      uploadDate: new Date(),
      category: category,
      tags: tags
    }));

    setMediaFiles(prev => [...prev, ...newFiles]);
    setShowUploadDialog(false);
    setSelectedFiles([]);

    toast({
      title: "Upload réussi",
      description: `${files.length} fichier(s) uploadé(s) avec succès.`
    });
  };

  const handleDelete = (fileId: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "Fichier supprimé",
      description: "Le fichier a été supprimé avec succès."
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
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestionnaire de Médias
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos images, logos, vidéos et favicon
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

        {/* Filtres et recherche */}
        <Card className="mb-6">
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
                        {category.label}
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

        {/* Dialog d'upload */}
        <UploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          files={selectedFiles}
          onUpload={handleUpload}
          categories={categories}
        />

        {/* Dialog de preview */}
        <PreviewDialog
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      </div>
    </div>
  );
}

// Composant Dialog d'upload
interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  onUpload: (files: File[], category: string, tags: string[]) => void;
  categories: { value: string; label: string }[];
}

function UploadDialog({ open, onOpenChange, files, onUpload, categories }: UploadDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState('gallery');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onUpload(files, selectedCategory, tagArray);
    setTags('');
    setSelectedCategory('gallery');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Télécharger des fichiers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Fichiers sélectionnés ({files.length})</Label>
            <div className="mt-2 space-y-1">
              {files.slice(0, 3).map((file, index) => (
                <div key={index} className="text-sm text-gray-600 truncate">
                  {file.name}
                </div>
              ))}
              {files.length > 3 && (
                <div className="text-sm text-gray-500">
                  ... et {files.length - 3} autre(s)
                </div>
              )}
            </div>
          </div>

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

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Télécharger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant Dialog de preview
interface PreviewDialogProps {
  file: MediaFile | null;
  onClose: () => void;
}

function PreviewDialog({ file, onClose }: PreviewDialogProps) {
  if (!file) return null;

  return (
    <Dialog open={!!file} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Taille</Label>
              <p className="text-gray-600">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <Label className="font-medium">Date d'upload</Label>
              <p className="text-gray-600">{file.uploadDate.toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="font-medium">Catégorie</Label>
              <p className="text-gray-600">{file.category}</p>
            </div>
            <div>
              <Label className="font-medium">Statut</Label>
              <p className="text-gray-600">{file.isActive ? 'Actif' : 'Inactif'}</p>
            </div>
          </div>

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

          <div className="flex gap-2">
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
