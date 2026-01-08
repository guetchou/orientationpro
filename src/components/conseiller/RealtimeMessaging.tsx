import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Video, 
  Phone, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  message_type: 'text' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
  sender_first_name: string;
  sender_last_name: string;
}

interface RealtimeMessagingProps {
  appointmentId: number;
  userId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar?: string;
}

export const RealtimeMessaging: React.FC<RealtimeMessagingProps> = ({
  appointmentId,
  userId,
  otherUserId,
  otherUserName,
  otherUserAvatar
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les messages existants
  useEffect(() => {
    loadMessages();
  }, [appointmentId]);

  // Connexion WebSocket pour les messages en temps réel
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = `ws://localhost:6464/ws/messages/${appointmentId}/${userId}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connecté');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'new_message') {
              setMessages(prev => [...prev, message.data]);
            } else if (message.type === 'message_read') {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === message.message_id 
                    ? { ...msg, is_read: true }
                    : msg
                )
              );
            }
          } catch (error) {
            console.error('Erreur parsing message WebSocket:', error);
          }
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket déconnecté');
          
          // Reconnexion automatique après 3 secondes
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              connectWebSocket();
            }
          }, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('Erreur WebSocket:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Erreur connexion WebSocket:', error);
        // Fallback: polling toutes les 2 secondes
        const interval = setInterval(loadMessages, 2000);
        return () => clearInterval(interval);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [appointmentId, userId]);

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messaging/appointment/${appointmentId}?user_id=${userId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messaging/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointment_id: appointmentId,
            sender_id: userId,
            receiver_id: otherUserId,
            message_type: 'text',
            content: newMessage.trim()
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        
        // Si WebSocket n'est pas connecté, ajouter le message manuellement
        if (!isConnected) {
          setMessages(prev => [...prev, data.data]);
        }
      } else {
        toast.error('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des messages...</span>
      </div>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback>
                {getInitials(otherUserName.split(' ')[0] || '', otherUserName.split(' ')[1] || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName}</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Zone des messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${message.sender_id === userId ? 'flex-row-reverse' : 'flex-row'}`}>
                    {message.sender_id !== userId && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={otherUserAvatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(message.sender_first_name, message.sender_last_name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`space-y-1 ${message.sender_id === userId ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-3 py-2 rounded-2xl ${
                          message.sender_id === userId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.message_type === 'file' ? (
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            <a 
                              href={message.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {message.file_name}
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 text-xs text-gray-500 ${message.sender_id === userId ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span>{formatTime(message.created_at)}</span>
                        {message.sender_id === userId && (
                          <div className="flex items-center">
                            {message.is_read ? (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Zone de saisie */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="flex-1"
              disabled={isSending}
            />
            
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
