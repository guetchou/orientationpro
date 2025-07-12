import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Linkedin,
  Briefcase,
  MessageSquare,
  Calendar,
  Mail,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Zap,
  Shield,
  Users,
  Building
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  syncFrequency: string;
  dataImported: number;
  dataExported: number;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
  settings: Record<string, any>;
}

export const ExternalIntegrations = () => {
  const [activeTab, setActiveTab] = useState('social');
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import automatique de profils et synchronisation des offres',
      status: 'connected',
      lastSync: '2024-01-15T10:30:00Z',
      syncFrequency: 'Quotidien',
      dataImported: 156,
      dataExported: 23,
      icon: Linkedin,
      color: 'text-blue-600',
      features: ['Import profils', 'Synchronisation offres', 'Réseau professionnel'],
      settings: {
        autoSync: true,
        importCandidates: true,
        exportJobs: true,
        notifications: true
      }
    },
    {
      id: 'indeed',
      name: 'Indeed',
      description: 'Diffusion automatique des offres et collecte de candidatures',
      status: 'connected',
      lastSync: '2024-01-15T09:15:00Z',
      syncFrequency: 'Quotidien',
      dataImported: 89,
      dataExported: 45,
      icon: Briefcase,
      color: 'text-purple-600',
      features: ['Diffusion offres', 'Collecte CV', 'Analytics'],
      settings: {
        autoSync: true,
        importCandidates: true,
        exportJobs: true,
        notifications: true
      }
    },
    {
      id: 'glassdoor',
      name: 'Glassdoor',
      description: 'Intégration des reviews et benchmarking salarial',
      status: 'disconnected',
      lastSync: '2024-01-10T14:20:00Z',
      syncFrequency: 'Hebdomadaire',
      dataImported: 0,
      dataExported: 0,
      icon: Building,
      color: 'text-green-600',
      features: ['Reviews entreprises', 'Benchmark salarial', 'Réputation'],
      settings: {
        autoSync: false,
        importCandidates: false,
        exportJobs: false,
        notifications: false
      }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notifications en temps réel et collaboration équipe',
      status: 'connected',
      lastSync: '2024-01-15T11:45:00Z',
      syncFrequency: 'Temps réel',
      dataImported: 0,
      dataExported: 234,
      icon: MessageSquare,
      color: 'text-purple-600',
      features: ['Notifications', 'Collaboration', 'Channels'],
      settings: {
        autoSync: true,
        importCandidates: false,
        exportJobs: false,
        notifications: true
      }
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Synchronisation des entretiens et planification',
      status: 'connected',
      lastSync: '2024-01-15T12:00:00Z',
      syncFrequency: 'Temps réel',
      dataImported: 67,
      dataExported: 89,
      icon: Calendar,
      color: 'text-blue-600',
      features: ['Synchronisation entretiens', 'Planification', 'Rappels'],
      settings: {
        autoSync: true,
        importCandidates: false,
        exportJobs: false,
        notifications: true
      }
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Intégration email et calendrier Microsoft',
      status: 'error',
      lastSync: '2024-01-14T16:30:00Z',
      syncFrequency: 'Quotidien',
      dataImported: 23,
      dataExported: 12,
      icon: Mail,
      color: 'text-blue-600',
      features: ['Email automatique', 'Calendrier', 'Contacts'],
      settings: {
        autoSync: false,
        importCandidates: true,
        exportJobs: false,
        notifications: true
      }
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800">Connecté</Badge>;
      case 'disconnected': return <Badge variant="outline">Déconnecté</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: integration.status === 'connected' ? 'disconnected' : 'connected' }
        : integration
    ));
  };

  const handleSyncNow = (integrationId: string) => {
    // Simulation de synchronisation
    console.log(`Synchronisation de ${integrationId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-CG');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intégrations Externes</h2>
          <p className="text-gray-600">Connectez votre ATS aux plateformes populaires</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {integrations.filter(i => i.status === 'connected').length} connectées
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="productivity">Productivité</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6">
          <div className="grid gap-6">
            {integrations.filter(i => ['linkedin', 'indeed', 'glassdoor'].includes(i.id)).map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${integration.color.replace('text-', 'bg-')} bg-opacity-10`}>
                          <Icon className={`h-6 w-6 ${integration.color}`} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.name}
                            {getStatusIcon(integration.status)}
                          </CardTitle>
                          <p className="text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(integration.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleIntegration(integration.id)}
                        >
                          {integration.status === 'connected' ? 'Déconnecter' : 'Connecter'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{integration.dataImported}</div>
                        <div className="text-sm text-gray-600">Données importées</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{integration.dataExported}</div>
                        <div className="text-sm text-gray-600">Données exportées</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{integration.syncFrequency}</div>
                        <div className="text-sm text-gray-600">Fréquence sync</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {formatDate(integration.lastSync).split(' ')[0]}
                        </div>
                        <div className="text-sm text-gray-600">Dernière sync</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Fonctionnalités</h4>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`autoSync-${integration.id}`}
                            checked={integration.settings.autoSync}
                          />
                          <Label htmlFor={`autoSync-${integration.id}`}>Sync automatique</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`notifications-${integration.id}`}
                            checked={integration.settings.notifications}
                          />
                          <Label htmlFor={`notifications-${integration.id}`}>Notifications</Label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleSyncNow(integration.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync maintenant
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <div className="grid gap-6">
            {integrations.filter(i => ['slack'].includes(i.id)).map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${integration.color.replace('text-', 'bg-')} bg-opacity-10`}>
                          <Icon className={`h-6 w-6 ${integration.color}`} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.name}
                            {getStatusIcon(integration.status)}
                          </CardTitle>
                          <p className="text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(integration.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleIntegration(integration.id)}
                        >
                          {integration.status === 'connected' ? 'Déconnecter' : 'Connecter'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{integration.dataImported}</div>
                        <div className="text-sm text-gray-600">Messages reçus</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{integration.dataExported}</div>
                        <div className="text-sm text-gray-600">Messages envoyés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{integration.syncFrequency}</div>
                        <div className="text-sm text-gray-600">Fréquence</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Channels configurés</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">#recrutement</span>
                          <Badge variant="outline" className="text-xs">Actif</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">#candidatures</span>
                          <Badge variant="outline" className="text-xs">Actif</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">#entretiens</span>
                          <Badge variant="outline" className="text-xs">Actif</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid gap-6">
            {integrations.filter(i => ['google-calendar', 'outlook'].includes(i.id)).map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${integration.color.replace('text-', 'bg-')} bg-opacity-10`}>
                          <Icon className={`h-6 w-6 ${integration.color}`} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.name}
                            {getStatusIcon(integration.status)}
                          </CardTitle>
                          <p className="text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(integration.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleIntegration(integration.id)}
                        >
                          {integration.status === 'connected' ? 'Déconnecter' : 'Connecter'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{integration.dataImported}</div>
                        <div className="text-sm text-gray-600">Événements importés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{integration.dataExported}</div>
                        <div className="text-sm text-gray-600">Événements exportés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{integration.syncFrequency}</div>
                        <div className="text-sm text-gray-600">Fréquence sync</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Types d'événements</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">Entretiens</Badge>
                        <Badge variant="secondary" className="text-xs">Réunions RH</Badge>
                        <Badge variant="secondary" className="text-xs">Formations</Badge>
                        <Badge variant="secondary" className="text-xs">Deadlines</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 