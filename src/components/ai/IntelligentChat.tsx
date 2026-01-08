import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Bot, User, Sparkles, MessageCircle, Brain, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntelligentChatbot } from '@/services/ai/IntelligentChatbot';
import { useMobile } from '@/hooks/useMobile';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggested_actions?: {
      action: string;
      label: string;
      type: 'navigation' | 'action' | 'external';
      url?: string;
    }[];
    quick_replies?: string[];
  };
}

interface IntelligentChatProps {
  userId: string;
  userProfile?: {
    name?: string;
    age?: number;
    education?: string;
    location?: string;
    career_goals?: string[];
    current_situation?: string;
  };
  onActionClick?: (action: string, url?: string) => void;
  className?: string;
  compact?: boolean;
}

export const IntelligentChat: React.FC<IntelligentChatProps> = ({
  userId,
  userProfile,
  onActionClick,
  className = '',
  compact = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatbot] = useState(() => new IntelligentChatbot());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobile();

  // Initialiser la conversation avec un message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour${userProfile?.name ? ` ${userProfile.name}` : ''} ! 👋 Je suis Oriana, votre assistante IA d'orientation professionnelle. Je suis là pour vous accompagner dans votre parcours de carrière. Comment puis-je vous aider aujourd'hui ?`,
        timestamp: new Date(),
        metadata: {
          intent: 'welcome',
          confidence: 100,
          quick_replies: [
            "Je cherche ma voie professionnelle",
            "J'ai besoin d'aide pour mon CV", 
            "Je veux passer un test d'orientation",
            "Je cherche du travail"
          ],
          suggested_actions: [
            {
              action: 'explore_tests',
              label: 'Découvrir les tests',
              type: 'navigation',
              url: '/tests'
            },
            {
              action: 'cv_help',
              label: 'Optimiser mon CV',
              type: 'navigation', 
              url: '/cv-optimizer'
            }
          ]
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [userProfile?.name, messages.length]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await chatbot.processMessage(userId, message, {
        profile: userProfile
      });

      // Simuler un délai de frappe pour une expérience plus naturelle
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          metadata: {
            intent: response.intent_detected,
            confidence: response.confidence,
            suggested_actions: response.suggested_actions,
            quick_replies: response.quick_replies
          }
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000); // 1-2 secondes

    } catch (error) {
      console.error('Erreur envoi message:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "Je suis désolée, j'ai rencontré un problème. Pouvez-vous réessayer ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleActionClick = (action: string, url?: string) => {
    if (onActionClick) {
      onActionClick(action, url);
    } else if (url) {
      window.location.href = url;
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} mb-4`}
    >
      <Avatar className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} flex-shrink-0`}>
        {message.role === 'assistant' ? (
          <>
            <AvatarImage src="/oriana-avatar.png" alt="Oriana" />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gray-100 text-gray-600">
            <User className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            rounded-lg px-4 py-2 ${compact ? 'text-sm' : 'text-base'}
            ${message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 border border-gray-200'
            }
          `}
        >
          {message.content}
        </div>

        {/* Métadonnées pour les messages assistant */}
        {message.role === 'assistant' && message.metadata && (
          <div className="mt-2 space-y-2">
            {/* Intent et confiance */}
            {message.metadata.intent && message.metadata.confidence && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  {message.metadata.intent} ({message.metadata.confidence}%)
                </Badge>
              </div>
            )}

            {/* Actions suggérées */}
            {message.metadata.suggested_actions && message.metadata.suggested_actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.metadata.suggested_actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size={compact ? "sm" : "default"}
                    onClick={() => handleActionClick(action.action, action.url)}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Réponses rapides */}
            {message.metadata.quick_replies && message.metadata.quick_replies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.metadata.quick_replies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size={compact ? "sm" : "default"}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );

  return (
    <Card className={`flex flex-col ${compact ? 'h-96' : 'h-[600px]'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/oriana-avatar.png" alt="Oriana" />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">Oriana</h3>
            <p className="text-sm text-gray-500">Assistante IA d'orientation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isTyping && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              En train d'écrire...
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        
        {/* Indicateur de frappe */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-4"
          >
            <Avatar className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} flex-shrink-0`}>
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tapez votre message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={isLoading || !inputMessage.trim()}
            size={isMobile ? "sm" : "default"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 Oriana utilise l'IA pour vous donner les meilleurs conseils d'orientation
        </p>
      </div>
    </Card>
  );
};
