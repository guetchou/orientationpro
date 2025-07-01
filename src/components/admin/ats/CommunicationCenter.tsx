
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Settings,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'interview' | 'rejection' | 'offer' | 'follow-up';
}

interface CommunicationCenterProps {
  onSendEmail?: (template: EmailTemplate, recipients: string[]) => void;
  onSendSMS?: (message: string, recipients: string[]) => void;
  onScheduleEmail?: (template: EmailTemplate, recipients: string[], scheduleDate: Date) => void;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  onSendEmail,
  onSendSMS,
  onScheduleEmail
}) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'interview-invitation',
      name: 'Invitation à l\'entretien',
      subject: 'Invitation à un entretien - {{position}}',
      content: `Bonjour {{name}},

Nous avons le plaisir de vous inviter à un entretien pour le poste de {{position}}.

Détails de l'entretien :
- Date : {{date}}
- Heure : {{time}}
- Lieu : {{location}}

Cordialement,
L'équipe RH`,
      type: 'interview'
    },
    {
      id: 'rejection',
      name: 'Refus de candidature',
      subject: 'Suite à votre candidature - {{position}}',
      content: `Bonjour {{name}},

Nous vous remercions pour l'intérêt que vous portez à notre entreprise et pour le temps consacré à votre candidature.

Après étude attentive de votre profil, nous avons le regret de vous informer que nous ne pouvons pas donner suite à votre candidature pour le poste de {{position}}.

Nous conservons votre candidature et vous recontacterons si un poste correspondant à votre profil se libère.

Cordialement,
L'équipe RH`,
      type: 'rejection'
    },
    {
      id: 'offer',
      name: 'Offre d\'emploi',
      subject: 'Offre d\'emploi - {{position}}',
      content: `Bonjour {{name}},

Nous avons le plaisir de vous proposer le poste de {{position}} au sein de notre équipe.

Détails de l'offre :
- Salaire : {{salary}}
- Date de début : {{start_date}}
- Contrat : {{contract_type}}

Cette offre est valable jusqu'au {{expiry_date}}.

Cordialement,
L'équipe RH`,
      type: 'offer'
    },
    {
      id: 'follow-up',
      name: 'Suivi de candidature',
      subject: 'Suivi de votre candidature - {{position}}',
      content: `Bonjour {{name}},

Nous vous remercions pour votre candidature au poste de {{position}}.

Votre dossier est actuellement en cours d'examen par notre équipe. Nous vous tiendrons informé(e) de l'évolution de votre candidature dans les plus brefs délais.

Cordialement,
L'équipe RH`,
      type: 'follow-up'
    }
  ];

  const handleSendCommunication = async () => {
    if (activeTab === 'email') {
      const template = emailTemplates.find(t => t.id === selectedTemplate);
      if (!template) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un template",
          variant: "destructive"
        });
        return;
      }

      if (isScheduled && scheduleDate) {
        onScheduleEmail?.(template, recipients, new Date(scheduleDate));
        toast({
          title: "Email programmé",
          description: `Email programmé pour le ${new Date(scheduleDate).toLocaleDateString()}`
        });
      } else {
        onSendEmail?.(template, recipients);
        toast({
          title: "Email envoyé",
          description: `Email envoyé à ${recipients.length} destinataire(s)`
        });
      }
    } else {
      if (!customMessage.trim()) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir un message",
          variant: "destructive"
        });
        return;
      }

      onSendSMS?.(customMessage, recipients);
      toast({
        title: "SMS envoyé",
        description: `SMS envoyé à ${recipients.length} destinataire(s)`
      });
    }

    // Reset form
    setSelectedTemplate('');
    setCustomMessage('');
    setRecipients([]);
    setScheduleDate('');
    setIsScheduled(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Centre de Communication</h3>
        <Badge variant="outline" className="px-3 py-1">
          Communication automatisée
        </Badge>
      </div>

      {/* Tabs Email/SMS */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Button
          variant={activeTab === 'email' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('email')}
          className="flex-1"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button
          variant={activeTab === 'sms' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sms')}
          className="flex-1"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          SMS
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTab === 'email' ? (
              <>
                <div>
                  <Label>Template d'email</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule-email"
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                  />
                  <Label htmlFor="schedule-email">Programmer l'envoi</Label>
                </div>

                {isScheduled && (
                  <div>
                    <Label>Date et heure d'envoi</Label>
                    <Input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                )}
              </>
            ) : (
              <div>
                <Label>Message SMS</Label>
                <Textarea
                  placeholder="Tapez votre message SMS..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  maxLength={160}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {customMessage.length}/160 caractères
                </div>
              </div>
            )}

            <div>
              <Label>Destinataires</Label>
              <Input
                placeholder="Emails séparés par des virgules"
                value={recipients.join(', ')}
                onChange={(e) => setRecipients(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
              <div className="text-xs text-gray-500 mt-1">
                {recipients.length} destinataire(s)
              </div>
            </div>

            <Button onClick={handleSendCommunication} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {isScheduled ? 'Programmer' : 'Envoyer'} {activeTab === 'email' ? 'Email' : 'SMS'}
            </Button>
          </CardContent>
        </Card>

        {/* Aperçu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Aperçu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'email' && selectedTemplate ? (
              <div className="space-y-3">
                {(() => {
                  const template = emailTemplates.find(t => t.id === selectedTemplate);
                  return template ? (
                    <>
                      <div>
                        <Label className="text-sm font-medium">Sujet :</Label>
                        <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          {template.subject}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Contenu :</Label>
                        <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded whitespace-pre-line">
                          {template.content}
                        </div>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            ) : activeTab === 'sms' && customMessage ? (
              <div>
                <Label className="text-sm font-medium">Message SMS :</Label>
                <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded mt-2">
                  {customMessage}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Sélectionnez un template ou tapez un message pour voir l'aperçu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historique des envois */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des envois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'email', template: 'Invitation à l\'entretien', recipients: 3, date: '2024-01-15 14:30', status: 'sent' },
              { type: 'sms', template: 'Rappel entretien', recipients: 1, date: '2024-01-15 09:00', status: 'sent' },
              { type: 'email', template: 'Offre d\'emploi', recipients: 1, date: '2024-01-14 16:45', status: 'scheduled' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {item.type === 'email' ? (
                    <Mail className="h-4 w-4 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{item.template}</p>
                    <p className="text-xs text-gray-500">
                      {item.recipients} destinataire(s) • {item.date}
                    </p>
                  </div>
                </div>
                <Badge variant={item.status === 'sent' ? 'default' : 'secondary'}>
                  {item.status === 'sent' ? 'Envoyé' : 'Programmé'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
