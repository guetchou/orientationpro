import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Mail, 
  Phone,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Link,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'interview' | 'meeting' | 'call' | 'other';
  attendees: string[];
  location?: string;
  videoLink?: string;
  description?: string;
  candidateId?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'other';
  connected: boolean;
  email: string;
  lastSync?: Date;
}

export const IntegratedCalendar: React.FC = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([
    { provider: 'google', connected: false, email: '' },
    { provider: 'outlook', connected: false, email: '' }
  ]);

  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Entretien React',
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      type: 'interview',
      attendees: ['recruteur@example.com', 'candidat@example.com'],
      location: 'Bureau A',
      candidateId: '123',
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Réunion équipe',
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
      type: 'meeting',
      attendees: ['manager@example.com', 'equipe@example.com'],
      location: 'Salle de conférence',
      status: 'confirmed'
    }
  ];

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setView(newView);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleCloseEventDialog = () => {
    setShowEventDialog(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendrier Intégré</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
            >
              Jour
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semaine
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
            >
              Mois
            </Button>
          </div>
          <Button onClick={() => setShowEventDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {/* Calendar integration status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.provider}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{integration.provider}</h3>
                    <p className="text-sm text-gray-500">
                      {integration.connected ? integration.email : 'Non connecté'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connecté
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Déconnecté
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    {integration.connected ? 'Synchroniser' : 'Connecter'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar view */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentDate.toLocaleDateString('fr-FR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Aujourd'hui
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-center text-gray-500 mt-32">
              Vue calendrier - Intégration {view} simulée
              <p className="text-sm mt-2">
                Les événements Google/Outlook apparaîtront ici
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
