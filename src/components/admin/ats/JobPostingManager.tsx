import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Globe, 
  Linkedin, 
  Facebook, 
  Mail, 
  QrCode, 
  Share2, 
  Copy, 
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  status: 'draft' | 'published' | 'closed';
  channels: string[];
  createdAt: string;
  expiresAt: string;
  applications: number;
  views: number;
}

export const JobPostingManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([
    {
      id: '1',
      title: 'Développeur Full-Stack React/Node.js',
      company: 'TechCongo SARL',
      location: 'Brazzaville, Congo',
      type: 'full-time',
      salary: { min: 800000, max: 1200000, currency: 'XAF' },
      description: 'Nous recherchons un développeur Full-Stack expérimenté pour rejoindre notre équipe...',
      requirements: ['React/Next.js', 'Node.js/Express', 'MongoDB/PostgreSQL', '3+ ans d\'expérience'],
      benefits: ['Assurance santé', 'Formation continue', 'Télétravail partiel', 'Équipement fourni'],
      status: 'published',
      channels: ['linkedin', 'africawork', 'emploi.cg'],
      createdAt: '2024-01-15',
      expiresAt: '2024-02-15',
      applications: 12,
      views: 156
    }
  ]);

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as const,
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    benefits: '',
    channels: [] as string[]
  });

  const availableChannels = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
    { id: 'africawork', name: 'AfricaWork', icon: Globe, color: 'bg-orange-500' },
    { id: 'jobartis', name: 'Jobartis', icon: Users, color: 'bg-green-600' },
    { id: 'emploi.cg', name: 'Emploi.cg', icon: MapPin, color: 'bg-red-600' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-500' },
    { id: 'whatsapp', name: 'WhatsApp', icon: Share2, color: 'bg-green-500' }
  ];

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.company || !newJob.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const job: JobPosting = {
      id: Date.now().toString(),
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      salary: {
        min: parseInt(newJob.salaryMin) || 0,
        max: parseInt(newJob.salaryMax) || 0,
        currency: 'XAF'
      },
      description: newJob.description,
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      benefits: newJob.benefits.split('\n').filter(b => b.trim()),
      status: 'draft',
      channels: newJob.channels,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applications: 0,
      views: 0
    };

    setJobPostings([...jobPostings, job]);
    setNewJob({
      title: '', company: '', location: '', type: 'full-time',
      salaryMin: '', salaryMax: '', description: '', requirements: '', benefits: '', channels: []
    });
    toast.success('Offre d\'emploi créée avec succès');
  };

  const handlePublishJob = (jobId: string) => {
    setJobPostings(jobs => 
      jobs.map(job => 
        job.id === jobId ? { ...job, status: 'published' as const } : job
      )
    );
    toast.success('Offre publiée sur tous les canaux sélectionnés');
  };

  const generateQRCode = (jobId: string) => {
    const jobUrl = `${window.location.origin}/jobs/${jobId}`;
    // Ici on pourrait intégrer une vraie génération de QR code
    toast.success('QR Code généré pour l\'offre');
    return jobUrl;
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Offres d'Emploi</h2>
          <p className="text-gray-600">Publiez et gérez vos offres sur tous les canaux</p>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Offre
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Créer</TabsTrigger>
          <TabsTrigger value="manage">Gérer</TabsTrigger>
          <TabsTrigger value="career">Page Carrière</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Offre d'Emploi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titre du poste *</label>
                  <Input
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="Développeur Full-Stack React/Node.js"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Entreprise *</label>
                  <Input
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    placeholder="TechCongo SARL"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Localisation</label>
                  <Input
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    placeholder="Brazzaville, Congo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type de contrat</label>
                  <Select value={newJob.type} onValueChange={(value: any) => setNewJob({...newJob, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Temps plein</SelectItem>
                      <SelectItem value="part-time">Temps partiel</SelectItem>
                      <SelectItem value="contract">Contrat</SelectItem>
                      <SelectItem value="internship">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Salaire min (XAF)</label>
                  <Input
                    type="number"
                    value={newJob.salaryMin}
                    onChange={(e) => setNewJob({...newJob, salaryMin: e.target.value})}
                    placeholder="800000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Salaire max (XAF)</label>
                  <Input
                    type="number"
                    value={newJob.salaryMax}
                    onChange={(e) => setNewJob({...newJob, salaryMax: e.target.value})}
                    placeholder="1200000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description du poste *</label>
                <Textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Décrivez le poste, les responsabilités..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Exigences (une par ligne)</label>
                  <Textarea
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    placeholder="React/Next.js&#10;Node.js/Express&#10;3+ ans d'expérience"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Avantages (un par ligne)</label>
                  <Textarea
                    value={newJob.benefits}
                    onChange={(e) => setNewJob({...newJob, benefits: e.target.value})}
                    placeholder="Assurance santé&#10;Formation continue&#10;Télétravail partiel"
                    rows={4}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Canaux de diffusion</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableChannels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant={newJob.channels.includes(channel.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const updated = newJob.channels.includes(channel.id)
                          ? newJob.channels.filter(c => c !== channel.id)
                          : [...newJob.channels, channel.id];
                        setNewJob({...newJob, channels: updated});
                      }}
                      className="justify-start"
                    >
                      <channel.icon className="h-4 w-4 mr-2" />
                      {channel.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreateJob} className="flex-1">
                  Créer l'offre
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('manage')}>
                  Voir toutes les offres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-4">
            {jobPostings.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                          {job.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job.salary)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applications} candidatures
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {job.views} vues
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.channels.map((channelId) => {
                          const channel = availableChannels.find(c => c.id === channelId);
                          return channel ? (
                            <Badge key={channelId} variant="outline" className="text-xs">
                              <channel.icon className="h-3 w-3 mr-1" />
                              {channel.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => generateQRCode(job.id)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {job.status === 'draft' && (
                        <Button size="sm" onClick={() => handlePublishJob(job.id)}>
                          Publier
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="career" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Carrière Personnalisable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">URL de votre page carrière</h3>
                    <p className="text-sm text-gray-600">Partagez ce lien pour attirer les candidats</p>
                  </div>
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copier le lien
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">https://orientationpro.cg/careers/techcongo</code>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom de l'entreprise</label>
                    <Input defaultValue="TechCongo SARL" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Logo de l'entreprise</label>
                    <Input type="file" accept="image/*" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description de l'entreprise</label>
                    <Textarea 
                      defaultValue="TechCongo est une entreprise innovante spécialisée dans le développement de solutions digitales..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Couleur principale</label>
                    <Input type="color" defaultValue="#3B82F6" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    Prévisualiser
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter en PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 