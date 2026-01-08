import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  MessageSquare,
  Sparkles,
  Lightbulb,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import {
  AIChatAdvisor,
  ChatMessage,
  AdviceCategory,
} from '@/services/ats/AIChatAdvisor';
import { CandidateProfile } from '@/services/ats/PredictiveScoringService';

interface AIChatAdvisorWidgetProps {
  candidate?: CandidateProfile;
  cvScore?: number;
  onAdviceGenerated?: (advice: AdviceCategory[]) => void;
}

/**
 * Widget d'IA conversationnelle pour conseils personnalisés
 */
export const AIChatAdvisorWidget: React.FC<AIChatAdvisorWidgetProps> = ({
  candidate,
  cvScore,
  onAdviceGenerated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedAdvice, setPersonalizedAdvice] = useState<AdviceCategory[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatAdvisor = new AIChatAdvisor();

  // Générer des conseils personnalisés au chargement si candidat fourni
  useEffect(() => {
    if (candidate) {
      generatePersonalizedAdvice();
    }
  }, [candidate]);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generatePersonalizedAdvice = () => {
    if (!candidate) return;

    const advice = chatAdvisor.generatePersonalizedAdvice(candidate);
    setPersonalizedAdvice(advice);

    // Message initial avec conseils
    const initialMessage: ChatMessage = {
      id: 'initial',
      role: 'assistant',
      content: `Bonjour ! J'ai analysé votre profil et j'ai ${advice.length} catégories de conseils personnalisés pour vous. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date(),
      metadata: { cvScore },
    };

    setMessages([initialMessage]);

    if (onAdviceGenerated) {
      onAdviceGenerated(advice);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAdvisor.respondToQuestion(input, {
        candidate,
        cvScore,
      });

      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const quickQuestions = [
    'Comment améliorer mon CV ?',
    'Quelles compétences développer ?',
    'Quel type de poste me correspond ?',
    'Comment préparer un entretien ?',
  ];

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>Assistant IA</CardTitle>
          </div>
          {personalizedAdvice.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              {personalizedAdvice.length} conseils
            </Badge>
          )}
        </div>
        <CardDescription>
          Conseils personnalisés basés sur votre profil
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-current/20">
                        <p className="text-xs font-semibold mb-1">Suggestions :</p>
                        <ul className="text-xs space-y-1">
                          {message.metadata.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Conseils personnalisés */}
        {personalizedAdvice.length > 0 && (
          <div className="border-t p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Conseils personnalisés</p>
            </div>
            <div className="space-y-2">
              {personalizedAdvice.slice(0, 2).map((advice) => (
                <div
                  key={advice.category}
                  className="text-xs p-2 bg-background rounded border"
                  onClick={() => handleQuickQuestion(advice.title)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {advice.priority === 'high' ? '🚨' : advice.priority === 'medium' ? '⚡' : '💡'}
                    </Badge>
                    <span className="font-medium">{advice.title}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{advice.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions rapides */}
        {messages.length === 1 && (
          <div className="border-t p-4 bg-muted/50">
            <p className="text-xs font-semibold mb-2">Questions rapides :</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

