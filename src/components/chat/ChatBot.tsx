
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useMobile } from '../../hooks/use-mobile';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Bonjour ! Je suis votre assistant d'orientation. Comment puis-je vous aider aujourd'hui ?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const initialBodyOverflow = useRef<string>('');

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle body overflow when chat is open on mobile
  useEffect(() => {
    if (isMobile) {
      initialBodyOverflow.current = document.body.style.overflow;
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = initialBodyOverflow.current;
      }
    }

    return () => {
      if (isMobile) {
        document.body.style.overflow = initialBodyOverflow.current;
      }
    };
  }, [isOpen, isMobile]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example response based on keywords
      let responseContent = "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ?";
      const input = userInput.toLowerCase();
      
      if (input.includes('test') || input.includes('évaluation')) {
        responseContent = "Nous proposons différents tests d'orientation professionnelle. Vous pouvez les découvrir dans la section 'Tests'.";
      } else if (input.includes('métier') || input.includes('profession') || input.includes('carrière')) {
        responseContent = "Il existe de nombreuses possibilités de carrière. Avez-vous déjà passé notre test RIASEC pour découvrir les métiers qui correspondent à votre profil ?";
      } else if (input.includes('étude') || input.includes('formation') || input.includes('diplôme')) {
        responseContent = "Les formations sont un élément clé de votre parcours. Avez-vous une idée du domaine qui vous intéresse ?";
      }
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Désolé, je n'ai pas pu traiter votre demande.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-12 h-12 rounded-full shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed bottom-20 right-4 z-50 w-80 md:w-96 h-[500px] max-h-[80vh] bg-white rounded-xl shadow-xl flex flex-col"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.3 }}
          >
            {/* Chat header */}
            <div className="p-4 border-b bg-primary text-white rounded-t-xl flex justify-between items-center">
              <h3 className="font-medium">Assistant d'orientation</h3>
              <Button 
                size="sm" 
                className="h-7 w-7 p-0 bg-primary/20 hover:bg-primary/30"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  rows={2}
                  className="resize-none"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon"
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
