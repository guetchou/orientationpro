import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Video,
  Phone,
  Mail,
  Settings,
  BarChart3,
  User,
  Award,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppointmentScheduler } from './AppointmentScheduler';
import { RealtimeMessaging } from './RealtimeMessaging';

interface CounselorStats {
  total_appointments: number;
  completed_appointments: number;
  pending_appointments: number;
  average_rating: number;
  appointments_last_30_days: number;
  profile: {
    specializations: string[];
    experience_years: number;
    hourly_rate: number;
    total_sessions: number;
    is_verified: boolean;
  };
}

interface Appointment {
  id: number;
  appointment_type: string;
  status: string;
  scheduled_at: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  rating: number;
  notes: string;
  meeting_link: string;
}

interface Conversation {
  appointment_id: number;
  appointment_type: string;
  status: string;
  other_user_first_name: string;
  other_user_last_name: string;
  other_user_email: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
}

export const CounselorDashboard: React.FC = () => {
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data pour la démo
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simuler le chargement des données
      setTimeout(() => {
        setStats({
          total_appointments: 45,
          completed_appointments: 38,
          pending_appointments: 7,
          average_rating: 4.8,
          appointments_last_30_days: 12,
          profile: {
            specializations: ['Orientation professionnelle', 'Développement de carrière', 'Leadership'],
            experience_years: 8,
            hourly_rate: 15000,
            total_sessions: 38,
            is_verified: true
          }
        });

        setAppointments([
          {
            id: 1,
            appointment_type: 'orientation',
            status: 'confirmed',
            scheduled_at: '2024-01-20T14:00:00',
            client_first_name: 'Marie',
            client_last_name: 'Mabiala',
            client_email: 'marie.mabiala@email.com',
            rating: 0,
            notes: 'Première session d\'orientation',
            meeting_link: 'https://meet.orientationpro.cg/appointment/1'
          },
          {
            id: 2,
            appointment_type: 'cv_review',
            status: 'pending',
            scheduled_at: '2024-01-22T10:00:00',
            client_first_name: 'Jean',
            client_last_name: 'Kouba',
            client_email: 'jean.kouba@email.com',
            rating: 0,
            notes: 'Révision de CV pour poste ingénieur',
            meeting_link: 'https://meet.orientationpro.cg/appointment/2'
          }
        ]);

        setConversations([
          {
            appointment_id: 1,
            appointment_type: 'orientation',
            status: 'confirmed',
            other_user_first_name: 'Marie',
            other_user_last_name: 'Mabiala',
            other_user_email: 'marie.mabiala@email.com',
            unread_count: 2,
            last_message: 'Merci pour la séance d\'hier, c\'était très utile !',
            last_message_time: '2024-01-19T16:30:00'
          }
        ]);

        setIsLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête avec statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rendez-vous</p>
                  <p className="text-2xl font-bold">{stats?.total_appointments || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                  <p className="text-2xl font-bold">{stats?.average_rating || 0}/5</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ce Mois</p>
                  <p className="text-2xl font-bold">{stats?.appointments_last_30_days || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux Horaire</p>
                  <p className="text-2xl font-bold">{stats?.profile.hourly_rate || 0} FCFA</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Onglets principaux */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prochains rendez-vous */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Prochains Rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {appointment.client_first_name} {appointment.client_last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.scheduled_at)}
                        </p>
                        <Badge className={`mt-1 ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistiques de performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taux de complétion</span>
                    <span>{Math.round((stats?.completed_appointments || 0) / (stats?.total_appointments || 1) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(stats?.completed_appointments || 0) / (stats?.total_appointments || 1) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Satisfaction client</span>
                    <span>{stats?.average_rating || 0}/5</span>
                  </div>
                  <Progress value={(stats?.average_rating || 0) / 5 * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats?.profile.experience_years || 0}</p>
                    <p className="text-sm text-gray-600">Années d'expérience</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats?.profile.total_sessions || 0}</p>
                    <p className="text-sm text-gray-600">Sessions totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages récents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div key={conversation.appointment_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {conversation.other_user_first_name} {conversation.other_user_last_name}
                        </p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {conversation.last_message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="w-5 h-5 flex items-center justify-center p-0 text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rendez-vous */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Gestion des Rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {appointment.client_first_name} {appointment.client_last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.client_email}</p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date et heure</p>
                        <p className="text-sm">{formatDate(appointment.scheduled_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <p className="text-sm capitalize">{appointment.appointment_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Notes</p>
                        <p className="text-sm">{appointment.notes}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4 mr-2" />
                        Rejoindre
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des conversations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div key={conversation.appointment_id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {conversation.other_user_first_name} {conversation.other_user_last_name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.last_message}
                          </p>
                        </div>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="w-5 h-5 flex items-center justify-center p-0 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Zone de messagerie */}
            <div>
              <RealtimeMessaging
                appointmentId={1}
                userId={1}
                otherUserId={2}
                otherUserName="Marie Mabiala"
              />
            </div>
          </div>
        </TabsContent>

        {/* Profil */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations Professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Spécialisations</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stats?.profile.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expérience</p>
                    <p className="text-lg font-semibold">{stats?.profile.experience_years} ans</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux horaire</p>
                    <p className="text-lg font-semibold">{stats?.profile.hourly_rate} FCFA</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm">
                    {stats?.profile.is_verified ? 'Conseiller vérifié' : 'En attente de vérification'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Gérer les disponibilités
                </Button>
                <Button className="w-full" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Modifier les tarifs
                </Button>
                <Button className="w-full" variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Modifier le profil
                </Button>
                <Button className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Paramètres de notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
