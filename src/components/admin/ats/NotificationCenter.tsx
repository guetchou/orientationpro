
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  Mail, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Zap,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actions?: { label: string; action: () => void }[];
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
  lastTriggered?: Date;
}

export const NotificationCenter: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'notifications' | 'automation'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Candidat sans suite depuis 7 jours',
      message: 'Jean Dupont attend une réponse depuis 7 jours pour le poste de Développeur React',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      actions: [
        { label: 'Programmer entretien', action: () => console.log('Schedule interview') },
        { label: 'Envoyer email', action: () => console.log('Send email') }
      ]
    },
    {
      id: '2',
      type: 'success',
      title: 'Nouveau candidat qualifié',
      message: 'Marie Martin a postulé pour Chef de Projet avec un score de 95%',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      actions: [
        { label: 'Voir profil', action: () => console.log('View profile') }
      ]
    },
    {
      id: '3',
      type: 'info',
      title: 'Rappel entretien',
      message: 'Entretien avec Paul Dubois programmé demain à 14h00',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Échec envoi email',
      message: 'Impossible d\'envoyer l\'email de confirmation à sophie@email.com',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: false,
      actions: [
        { label: 'Réessayer', action: () => console.log('Retry email') }
      ]
    }
  ]);

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Rappel candidats en attente',
      trigger: 'Candidat sans activité',
      condition: 'Plus de 5 jours',
      action: 'Envoyer notification RH',
      isActive: true,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Auto-scoring candidats',
      trigger: 'Nouveau CV reçu',
      condition: 'Score IA > 80%',
      action: 'Programmer entretien automatique',
      isActive: true,
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Rappel entretiens',
      trigger: 'Entretien programmé',
      condition: '24h avant',
      action: 'Email + SMS candidat et RH',
      isActive: true
    },
    {
      id: '4',
      name: 'Suivi post-entretien',
      trigger: 'Entretien terminé',
      condition: 'Pas de feedback après 2 jours',
      action: 'Rappel RH pour feedback',
      isActive: false
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
    toast({
      title: "Règle mise à jour",
      description: "La règle d'automatisation a été modifiée",
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Centre de Notifications</h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            {unreadCount} non lues
          </Badge>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('notifications')}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
            <Button
              variant={activeTab === 'automation' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('automation')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Automatisation
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'notifications' ? (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notifications récentes</h3>
              <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
                Tout marquer comme lu
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`hover:shadow-md transition-all cursor-pointer ${
                      !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          {notification.actions && (
                            <div className="flex gap-2">
                              {notification.actions.map((action, actionIndex) => (
                                <Button
                                  key={actionIndex}
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.action();
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="automation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Règles d'automatisation</h3>
              <Button className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Nouvelle règle
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {automationRules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{rule.name}</CardTitle>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleAutomationRule(rule.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Déclencheur:</span>
                          <span className="font-medium">{rule.trigger}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Condition:</span>
                          <span className="font-medium">{rule.condition}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Action:</span>
                          <span className="font-medium">{rule.action}</span>
                        </div>
                      </div>
                      
                      {rule.lastTriggered && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                          Dernière exécution: {rule.lastTriggered.toLocaleString('fr-FR')}
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Statistiques d'automatisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistiques d'automatisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">247</div>
                    <div className="text-sm text-green-600">Actions automatisées</div>
                    <div className="text-xs text-gray-500">Ce mois</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">15h</div>
                    <div className="text-sm text-blue-600">Temps économisé</div>
                    <div className="text-xs text-gray-500">Cette semaine</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">98%</div>
                    <div className="text-sm text-purple-600">Taux de succès</div>
                    <div className="text-xs text-gray-500">Toutes règles</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">12</div>
                    <div className="text-sm text-orange-600">Règles actives</div>
                    <div className="text-xs text-gray-500">Sur 15 total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
