import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Phone, 
  Send, 
  Bot, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Download,
  Upload,
  QrCode,
  Copy,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Globe,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppMessage {
  id: string;
  phoneNumber: string;
  candidateName: string;
  message: string;
  type: 'incoming' | 'outgoing' | 'automated';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: string[];
  jobId?: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'interview' | 'rejection' | 'offer' | 'reminder';
  content: string;
  variables: string[];
  isActive: boolean;
}

interface WhatsAppCampaign {
  id: string;
  name: string;
  template: WhatsAppTemplate;
  candidates: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduledAt?: string;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
}

export const WhatsAppIntegration = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: '1',
      phoneNumber: '+242 06 12 34 56 78',
      candidateName: 'Jean Dupont',
      message: 'Bonjour, je suis intéressé par le poste de développeur. Voici mon CV.',
      type: 'incoming',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'read',
      attachments: ['cv_jean_dupont.pdf'],
      jobId: 'job_1'
    },
    {
      id: '2',
      phoneNumber: '+242 06 12 34 56 78',
      candidateName: 'Jean Dupont',
      message: 'Merci pour votre candidature ! Nous avons bien reçu votre CV et nous vous recontacterons dans les 48h.',
      type: 'outgoing',
      timestamp: '2024-01-15T10:32:00Z',
      status: 'delivered'
    }
  ]);

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([
    {
      id: '1',
      name: 'Accusé de réception',
      category: 'welcome',
      content: 'Bonjour {{name}}, nous avons bien reçu votre candidature pour le poste de {{position}}. Nous vous recontacterons dans les 48h.',
      variables: ['name', 'position'],
      isActive: true
    },
    {
      id: '2',
      name: 'Invitation entretien',
      category: 'interview',
      content: 'Bonjour {{name}}, nous avons le plaisir de vous inviter à un entretien le {{date}} à {{time}}. Lieu: {{location}}',
      variables: ['name', 'date', 'time', 'location'],
      isActive: true
    }
  ]);

  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPhone, setSelectedPhone] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedPhone) {
      toast.error('Veuillez saisir un message et un numéro de téléphone');
      return;
    }

    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      phoneNumber: selectedPhone,
      candidateName: 'Candidat',
      message: newMessage,
      type: 'outgoing',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages([message, ...messages]);
    setNewMessage('');
    toast.success('Message envoyé');
  };

  const handleCreateTemplate = () => {
    // Logique pour créer un template
    toast.success('Template créé');
  };

  const handleCreateCampaign = () => {
    // Logique pour créer une campagne
    toast.success('Campagne créée');
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'sent': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <User className="h-4 w-4 text-blue-500" />;
      case 'outgoing': return <Send className="h-4 w-4 text-green-500" />;
      case 'automated': return <Bot className="h-4 w-4 text-purple-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intégration WhatsApp</h2>
          <p className="text-gray-600">Communication automatisée et candidatures par WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Connecté
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot IA</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          {/* Envoi de message */}
          <Card>
            <CardHeader>
              <CardTitle>Envoyer un message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Numéro de téléphone</label>
                  <Input
                    value={selectedPhone}
                    onChange={(e) => setSelectedPhone(e.target.value)}
                    placeholder="+242 06 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Sélectionner un template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Joindre fichier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historique des messages */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'incoming' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                      message.type === 'incoming' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-green-500 text-white'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getMessageTypeIcon(message.type)}
                        <span className="text-xs opacity-75">
                          {message.candidateName} • {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        {getMessageStatusIcon(message.status)}
                      </div>
                      <p className="text-sm">{message.message}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {message.attachments.map((attachment, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              📎 {attachment}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Templates de messages</h3>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.category}
                        </Badge>
                        <Badge variant={template.isActive ? 'default' : 'outline'}>
                          {template.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Campagnes WhatsApp</h3>
            <Button onClick={handleCreateCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Button>
          </div>

          <div className="grid gap-4">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune campagne créée</p>
                  <p className="text-sm text-gray-400">Créez votre première campagne pour envoyer des messages en masse</p>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">
                          Template: {campaign.template.name} • {campaign.candidates.length} destinataires
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{campaign.sentCount}</div>
                          <div className="text-xs text-gray-500">Envoyés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{campaign.deliveredCount}</div>
                          <div className="text-xs text-gray-500">Livrés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{campaign.readCount}</div>
                          <div className="text-xs text-gray-500">Lus</div>
                        </div>
                        <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot IA pour Candidatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Configuration du Chatbot</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableChatbot" defaultChecked className="rounded" />
                      <label htmlFor="enableChatbot" className="text-sm">Activer le chatbot</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="autoReply" defaultChecked className="rounded" />
                      <label htmlFor="autoReply" className="text-sm">Réponses automatiques</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="cvCollection" defaultChecked className="rounded" />
                      <label htmlFor="cvCollection" className="text-sm">Collecte automatique de CV</label>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">QR Code d'accès</h4>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <div className="w-32 h-32 bg-white mx-auto mb-2 flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">Scannez pour accéder au chatbot</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger QR
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Questions fréquentes configurées</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Comment postuler ?</p>
                      <p className="text-sm text-gray-600">Envoyez votre CV par WhatsApp</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Quels sont les postes disponibles ?</p>
                      <p className="text-sm text-gray-600">Liste automatique des offres actives</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Statut de ma candidature</p>
                      <p className="text-sm text-gray-600">Vérification automatique par nom</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
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