
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Send, Calendar, FileText, Mail, Phone, MessageSquare, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface CandidateActionCenterProps {
  candidateId?: string;
  candidateName?: string;
  onActionComplete?: (action: string, details: any) => void;
}

const actionVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

export const CandidateActionCenter: React.FC<CandidateActionCenterProps> = ({
  candidateId,
  candidateName,
  onActionComplete
}) => {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');

  const quickActions = [
    {
      id: 'schedule-interview',
      label: 'Programmer entretien',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Planifier un entretien avec le candidat'
    },
    {
      id: 'send-email',
      label: 'Envoyer email',
      icon: Mail,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Envoyer un email personnalisé'
    },
    {
      id: 'make-call',
      label: 'Appeler',
      icon: Phone,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Initier un appel téléphonique'
    },
    {
      id: 'send-offer',
      label: 'Envoyer offre',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Générer et envoyer une offre d\'emploi'
    },
    {
      id: 'group-interview',
      label: 'Entretien collectif',
      icon: Users,
      color: 'bg-teal-500 hover:bg-teal-600',
      description: 'Organiser un entretien de groupe'
    },
    {
      id: 'feedback',
      label: 'Laisser feedback',
      icon: MessageSquare,
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Ajouter des commentaires détaillés'
    }
  ];

  const handleQuickAction = async (actionId: string) => {
    setActiveAction(actionId);
    
    // Simulate action processing
    setTimeout(() => {
      toast({
        title: "Action exécutée",
        description: `L'action "${quickActions.find(a => a.id === actionId)?.label}" a été effectuée avec succès.`,
      });
      
      onActionComplete?.(actionId, { candidateId, timestamp: new Date().toISOString() });
      setActiveAction(null);
    }, 1500);
  };

  const emailTemplates = [
    { value: 'invitation-interview', label: 'Invitation à l\'entretien' },
    { value: 'rejection', label: 'Lettre de refus' },
    { value: 'offer', label: 'Offre d\'emploi' },
    { value: 'follow-up', label: 'Suivi de candidature' }
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Centre d'actions</h3>
          {candidateName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Actions pour {candidateName}
            </p>
          )}
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Actions rapides
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              variants={actionVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1 }
              }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-24 w-full flex flex-col items-center gap-2 text-white border-0 ${action.color} hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}
                    disabled={activeAction === action.id}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <action.icon className="h-6 w-6" />
                    <span className="text-xs font-medium text-center">{action.label}</span>
                    {activeAction === action.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <action.icon className="h-5 w-5" />
                      {action.label}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-4">
                    {action.id === 'send-email' && (
                      <>
                        <Select onValueChange={setEmailTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un template" />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map(template => (
                              <SelectItem key={template.value} value={template.value}>
                                {template.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Textarea
                          placeholder="Personnaliser le message..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                        />
                      </>
                    )}

                    {action.id === 'schedule-interview' && (
                      <>
                        <Input
                          type="datetime-local"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                        />
                        <Textarea
                          placeholder="Notes pour l'entretien..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </>
                    )}

                    {(action.id === 'feedback' || action.id === 'make-call') && (
                      <Textarea
                        placeholder={action.id === 'feedback' ? 'Votre feedback...' : 'Notes d\'appel...'}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    )}

                    <Button 
                      onClick={() => handleQuickAction(action.id)}
                      className="w-full"
                      disabled={activeAction === action.id}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {activeAction === action.id ? 'Traitement...' : 'Exécuter l\'action'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Recent Actions */}
      <div className="mt-8">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Actions récentes</h4>
        <div className="space-y-2">
          {[
            { action: 'Email envoyé', time: '2 min ago', status: 'success' },
            { action: 'Entretien programmé', time: '1h ago', status: 'pending' },
            { action: 'Notes ajoutées', time: '3h ago', status: 'success' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'success' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <span className="text-sm">{item.action}</span>
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
