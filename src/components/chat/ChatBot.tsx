
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./ChatMessage";
import { MessageCircle, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Bonjour ! Je suis votre assistant d'orientation. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate response (replace with actual API call in production)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(message),
        isUser: false,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userMessage: string): string => {
    const normalizedMessage = userMessage.toLowerCase();
    
    if (normalizedMessage.includes("test") || normalizedMessage.includes("orientation")) {
      return "Nous proposons plusieurs tests d'orientation professionnelle ! Je vous invite à consulter notre page Tests pour découvrir celui qui vous convient le mieux.";
    } else if (normalizedMessage.includes("conseil") || normalizedMessage.includes("aide")) {
      return "Nos conseillers d'orientation sont disponibles pour vous accompagner ! Vous pouvez prendre rendez-vous sur notre plateforme ou nous contacter directement.";
    } else if (normalizedMessage.includes("métier") || normalizedMessage.includes("profession")) {
      return "Pour découvrir les métiers qui correspondent à votre profil, je vous recommande de commencer par un test RIASEC. Ensuite, nous pourrons explorer ensemble les options qui s'offrent à vous.";
    } else if (normalizedMessage.includes("merci") || normalizedMessage.includes("super")) {
      return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
    } else {
      return "Je comprends votre demande. Pour une assistance plus personnalisée, pourriez-vous me donner plus de détails sur ce que vous recherchez ?";
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const chatVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2, yoyo: Infinity, repeatDelay: 0.5 } }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={chatVariants}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4 w-[350px] max-w-[95vw] border border-gray-100"
          >
            {/* Chat header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold">Assistant d'orientation</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Chat messages */}
            <div className="h-[350px] overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} content={msg.content} isUser={msg.isUser} timestamp={msg.timestamp} />
                ))}
                {isTyping && (
                  <div className="flex gap-1 items-center text-sm text-gray-500 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Chat input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!message.trim()}>
                  Envoyer
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <motion.div
        initial="initial"
        whileHover="hover"
        animate={isOpen ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
        variants={buttonVariants}
      >
        <Button
          onClick={toggleChat}
          size="lg"
          className={`rounded-full shadow-lg p-4 ${
            isOpen 
              ? "bg-gray-700 hover:bg-gray-800" 
              : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          }`}
        >
          {isOpen ? <ChevronDown className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>
    </div>
  );
};
