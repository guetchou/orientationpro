
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Mail, 
  Phone,
  Video,
  MapPin,
  Plus,
  Settings,
  Sync,
  Google,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'interview' | 'meeting' | 'call' | 'other';
  attendees: { name: string; email: string }[];
  location?: string;
  meetingLink?: string;
  source: 'google' | 'outlook' | 'manual';
  candidateId?: string;
}

interface CalendarIntegration {
  provider: 'google' | 'outlook';
  connected: boolean;
  email?: string;
  lastSync?: Date;
}

export const IntegratedCalendar: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([
    { provider: 'google', connected: false },
    { provider: 'outlook', connected: false }
  ]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // Événements simulés
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Entretien - Jean Dupont',
        description: 'Entretien technique pour le poste de Développeur React',
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
        type: 'interview',
        attendees: [
          { name: 'Jean Dupont', email: 'jean.dupont@email.com' },
          { name: 'Marie Martin', email: 'marie.martin@company.com' }
        ],
        location: 'Salle de réunion A',
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        source: 'google',
        candidateId: '1'
      },
      {
        id: '2',
        title: 'Appel de présélection - Sophie Bernard',
        description: 'Premier contact téléphonique',
        start: new Date(2024, 0, 15, 14, 0),
        end: new Date(2024, 0, 15, 14, 30),
        type: 'call',
        attendees: [
          { name: 'Sophie Bernard', email: 'sophie.bernard@email.com' }
        ],
        source: 'manual',
        candidateId: '2'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const handleConnectCalendar = (provider: 'google' | 'outlook') => {
    // Simulation de la connexion
    setIntegrations(prev => 
      prev.map(integration => 
        integration.provider === provider 
          ? { ...integration, connected: true, email: `user@${provider}.com`, lastSync: new Date() }
          : integration
      )
    );
    
    toast({
      title: "Calendrier connecté",
      description: `Votre calendrier ${provider} a été connecté avec succès`,
    });
  };

  const handleSyncCalendar = (provider: 'google' | 'outlook') => {
    toast({
      title: "Synchronisation en cours",
      description: `Synchronisation du calendrier ${provider}...`,
    });

    // Simulation de la synchronisation
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.provider === provider 
            ? { ...integration, lastSync: new Date() }
            : integration
        )
      );
      
      toast({
        title: "Synchronisation terminée",
        description: `${provider} synchronisé avec succès`,
      });
    }, 2000);
  };

  const handleCreateEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title || 'Nouvel événement',
      description: eventData.description,
      start: eventData.start || new Date(),
      end: eventData.end || addDays(new Date(), 1),
      type: eventData.type || 'meeting',
      attendees: eventData.attendees || [],
      location: eventData.location,
      meetingLink: eventData.meetingLink,
      source: 'manual'
    };

    setEvents(prev => [...prev, newEvent]);
    setShowEventDialog(false);
    
    toast({
      title: "Événement créé",
      description: "L'événement a été ajouté au calendrier",
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Users className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Video className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-blue-500';
      case 'call':
        return 'bg-green-500';
      case 'meeting':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendrier Intégré</h2>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: 'day' | 'week' | 'month') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un événement</DialogTitle>
              </DialogHeader>
              <EventForm onSubmit={handleCreateEvent} onCancel={() => setShowEventDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Intégrations calendrier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Intégrations calendrier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.provider}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {integration.provider === 'google' ? (
                    <Google className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Mail className="h-6 w-6 text-blue-500" />
                  )}
                  <div>
                    <h4 className="font-medium capitalize">{integration.provider}</h4>
                    {integration.connected ? (
                      <div className="text-sm text-gray-500">
                        <p>{integration.email}</p>
                        {integration.lastSync && (
                          <p>Dernière sync: {format(integration.lastSync, 'HH:mm', { locale: fr })}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Non connecté</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Connecté
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncCalendar(integration.provider)}
                      >
                        <Sync className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnectCalendar(integration.provider)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Connecter
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={fr}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Événements du jour */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Événements - {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {getEventsForDate(selectedDate).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.type)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        
                        {event.meetingLink && (
                          <div className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Visioconférence
                          </div>
                        )}
                      </div>
                      
                      {event.attendees.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {event.attendees.length} participant(s)
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun événement prévu pour cette date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Composant formulaire pour créer un événement
const EventForm: React.FC<{
  onSubmit: (data: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting' as CalendarEvent['type'],
    start: new Date(),
    end: addDays(new Date(), 1),
    location: '',
    meetingLink: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interview">Entretien</SelectItem>
            <SelectItem value="call">Appel</SelectItem>
            <SelectItem value="meeting">Réunion</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="meetingLink">Lien de visioconférence</Label>
        <Input
          id="meetingLink"
          type="url"
          value={formData.meetingLink}
          onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Créer l'événement
        </Button>
      </div>
    </form>
  );
};
