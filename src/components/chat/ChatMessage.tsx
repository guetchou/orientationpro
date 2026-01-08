
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatMessage = ({ content, isUser, timestamp }: ChatMessageProps) => {
  const formattedTime = formatDistanceToNow(timestamp, { addSuffix: true, locale: fr });

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      x: isUser ? 20 : -20,
      y: 10 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: 500,
        damping: 40
      } 
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={messageVariants}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div 
        className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
          isUser 
            ? "bg-primary text-white rounded-br-none" 
            : "bg-white border border-gray-100 rounded-bl-none"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <div 
          className={`text-[10px] mt-1 ${
            isUser ? "text-white/70 text-right" : "text-gray-400"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </motion.div>
  );
};
