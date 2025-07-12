import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Download,
  Upload,
  Bell,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  MapPin,
  Globe,
  Flag,
  MessageSquare,
  Camera,
  QrCode,
  Settings,
  Eye,
  Edit,
  Trash2,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

interface MobileUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileCompletion: number;
  applicationsCount: number;
  interviewsCount: number;
  offersCount: number;
  lastActive: string;
  notificationsCount: number;
  cvUploaded: boolean;
  profileVerified: boolean;
}

interface MobileApplication {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  lastUpdate: string;
  salary: number;
  location: string;
  progress: number;
}

interface MobileNotification {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'reminder' | 'update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const MobileCandidateApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Données simulées adaptées au contexte congolais
  const mobileUsers: MobileUser[] = [
    {
      id: '1',
      name: 'Marie Nzouzi',
      email: 'marie.nzouzi@email.com',
      phone: '+242 06 12 34 56 78',
      location: 'Brazzaville',
      profileCompletion: 95,
      applicationsCount: 8,
      interviewsCount: 3,
      offersCount: 1,
      lastActive: '2024-01-15T10:30:00Z',
      notificationsCount: 5,
      cvUploaded: true,
      profileVerified: true
    },
    {
      id: '2',
      name: 'Pierre Makoumbou',
      email: 'pierre.makoumbou@email.com',
      phone: '+242 06 98 76 54 32',
      location: 'Pointe-Noire',
      profileCompletion: 78,
      applicationsCount: 12,
      interviewsCount: 5,
      offersCount: 2,
      lastActive: '2024-01-15T09:15:00Z',
      notificationsCount: 3,
      cvUploaded: true,
      profileVerified: false
    },
    {
      id: '3',
      name: 'Sophie Loundou',
      email: 'sophie.loundou@email.com',
      phone: '+242 06 45 67 89 01',
      location: 'Brazzaville',
      profileCompletion: 100,
      applicationsCount: 15,
      interviewsCount: 8,
      offersCount: 3,
      lastActive: '2024-01-15T11:45:00Z',
      notificationsCount: 8,
      cvUploaded: true,
      profileVerified: true
    }
  ];

  const mobileApplications: MobileApplication[] = [
    {
      id: '1',
      company: 'Tech Congo SARL',
      position: 'Développeur Full Stack',
      status: 'interview',
      appliedDate: '2024-01-10',
      lastUpdate: '2024-01-15',
      salary: 650000,
      location: 'Brazzaville',
      progress: 75
    },
    {
      id: '2',
      company: 'Digital Solutions CG',
      position: 'Data Analyst',
      status: 'screening',
      appliedDate: '2024-01-12',
      lastUpdate: '2024-01-14',
      salary: 480000,
      location: 'Brazzaville',
      progress: 45
    },
    {
      id: '3',
      company: 'PétroTech Congo',
      position: 'Chef de Projet IT',
      status: 'offer',
      appliedDate: '2024-01-08',
      lastUpdate: '2024-01-15',
      salary: 850000,
      location: 'Pointe-Noire',
      progress: 100
    }
  ];

  const mobileNotifications: MobileNotification[] = [
    {
      id: '1',
      type: 'interview',
      title: 'Entretien confirmé',
      message: 'Votre entretien avec Tech Congo SARL est confirmé pour demain à 14h00',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'offer',
      title: 'Nouvelle offre reçue',
      message: 'PétroTech Congo vous propose un poste de Chef de Projet IT',
      timestamp: '2024-01-15T09:15:00Z',
      read: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'application',
      title: 'Candidature en cours',
      message: 'Votre candidature chez Digital Solutions CG est en cours d\'examen',
      timestamp: '2024-01-15T08:45:00Z',
      read: true,
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied': return 'Candidature envoyée';
      case 'screening': return 'En cours d\'examen';
      case 'interview': return 'Entretien programmé';
      case 'offer': return 'Offre reçue';
      case 'rejected': return 'Refusée';
      default: return 'Inconnu';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'interview': return <Clock className="h-4 w-4" />;
      case 'offer': return <CheckCircle className="h-4 w-4" />;
      case 'application': return <FileText className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      case 'update': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CG', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Application Mobile Candidat</h2>
          <p className="text-gray-600">Simulation de l'app mobile pour candidats congolais</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            {mobileUsers.length} utilisateurs actifs
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Télécharger APK
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="applications">Candidatures</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6">
            {mobileUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {user.name}
                          {user.profileVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </CardTitle>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.location}
                      </Badge>
                      {user.notificationsCount > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {user.notificationsCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{user.applicationsCount}</div>
                      <div className="text-sm text-gray-600">Candidatures</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{user.interviewsCount}</div>
                      <div className="text-sm text-gray-600">Entretiens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{user.offersCount}</div>
                      <div className="text-sm text-gray-600">Offres</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{user.profileCompletion}%</div>
                      <div className="text-sm text-gray-600">Profil complet</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Complétion du profil</span>
                      <span className="text-sm text-gray-600">{user.profileCompletion}%</span>
                    </div>
                    <Progress value={user.profileCompletion} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {user.cvUploaded ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">CV {user.cvUploaded ? 'uploadé' : 'manquant'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Actif il y a {Math.floor((Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60))}h</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid gap-6">
            {mobileApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {application.company}
                      </CardTitle>
                      <p className="text-gray-600">{application.position}</p>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusLabel(application.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(application.salary)}
                      </div>
                      <div className="text-sm text-gray-600">Salaire</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{application.location}</div>
                      <div className="text-sm text-gray-600">Localisation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{application.progress}%</div>
                      <div className="text-sm text-gray-600">Progression</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progression de la candidature</span>
                      <span className="text-sm text-gray-600">{application.progress}%</span>
                    </div>
                    <Progress value={application.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Candidature envoyée le {new Date(application.appliedDate).toLocaleDateString('fr-CG')}</span>
                    <span>Dernière mise à jour le {new Date(application.lastUpdate).toLocaleDateString('fr-CG')}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacter
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications en temps réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border-l-4 border-red-500 bg-red-50 rounded-lg">
                  <Clock className="h-4 w-4 text-red-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Entretien confirmé</h4>
                    <p className="text-sm text-gray-600">Votre entretien avec Tech Congo SARL est confirmé pour demain à 14h00</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">Voir</Button>
                      <Button size="sm" variant="outline">Répondre</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Nouvelle offre reçue</h4>
                    <p className="text-sm text-gray-600">PétroTech Congo vous propose un poste de Chef de Projet IT</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">Voir</Button>
                      <Button size="sm" variant="outline">Accepter</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Gestion des profils candidats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Fonctionnalités du profil</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Upload CV depuis mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Photo de profil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Compétences et certifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Expérience professionnelle</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">QR Code d'accès</h4>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <div className="w-32 h-32 bg-white mx-auto mb-2 flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">Scannez pour accéder à l'app</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger QR
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Statistiques d'utilisation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-gray-600">Taux d'engagement</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-gray-600">Profils complets</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">4.8/5</div>
                    <div className="text-sm text-gray-600">Note utilisateurs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 