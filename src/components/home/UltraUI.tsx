import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Star, 
  Users, 
  Brain, 
  Briefcase, 
  Target,
  Heart,
  Zap,
  Shield,
  Award,
  TrendingUp,
  CheckCircle,
  Play,
  Sparkles,
  Globe,
  Eye,
  ChevronDown,
  Quote,
  BookOpen,
  MessageSquare,
  Calendar,
  Building,
  MapPin,
  Phone,
  Mail,
  Lock,
  Unlock,
  Maximize,
  Minimize,
  RotateCw,
  Settings,
  Download,
  Share2,
  ExternalLink,
  Filter,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';

/**
 * Composant de carte avec effet de néon
 */
export const NeonCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}> = ({ children, className = '', glowColor = 'blue', intensity = 1 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const glowColors = {
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    green: 'shadow-green-500/50',
    pink: 'shadow-pink-500/50',
    orange: 'shadow-orange-500/50',
    cyan: 'shadow-cyan-500/50',
  };

  return (
    <motion.div
      className={`relative group ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, rotateY: 5 }}
      transition={{ duration: 0.3 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Effet de néon animé */}
      <motion.div
        className={`absolute -inset-1 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColors[glowColor]}`}
        animate={{
          boxShadow: isHovered ? [
            `0 0 ${20 * intensity}px rgba(59, 130, 246, 0.5)`,
            `0 0 ${40 * intensity}px rgba(59, 130, 246, 0.3)`,
            `0 0 ${20 * intensity}px rgba(59, 130, 246, 0.5)`,
          ] : `0 0 ${10 * intensity}px rgba(59, 130, 246, 0.2)`,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Carte principale */}
      <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Effet de brillance qui suit la souris */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.8 }}
        />
        
        {children}
      </Card>
    </motion.div>
  );
};

/**
 * Composant de bouton avec effet holographique
 */
export const HolographicButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
    secondary: 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600',
    ghost: 'bg-gradient-to-r from-gray-600 via-blue-600 to-purple-600',
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-white shadow-lg ${variants[variant]} ${className}`}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ scale: 1.05, rotateX: 5 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
      }}
      style={{
        backgroundSize: '200% 200%',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Effet holographique */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Texte avec effet de profondeur */}
      <motion.span
        className="relative z-10"
        animate={{
          textShadow: [
            '0 0 10px rgba(255,255,255,0.5)',
            '0 0 20px rgba(255,255,255,0.8)',
            '0 0 10px rgba(255,255,255,0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {children}
      </motion.span>
      
      {/* Effet de pression */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isPressed ? 1 : 0,
          opacity: isPressed ? 1 : 0,
        }}
        transition={{ duration: 0.1 }}
      />
    </motion.button>
  );
};

/**
 * Composant de statistique avec effet de pulsation
 */
export const PulsingStat: React.FC<{
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  color: string;
  delay?: number;
  isAnimated?: boolean;
}> = ({ icon: Icon, value, label, suffix = '', color, delay = 0, isAnimated = true }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView && isAnimated) {
      const duration = 2000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function pour un effet plus naturel
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(value * easeOutCubic));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (isInView) {
      setDisplayValue(value);
    }
  }, [isInView, value, isAnimated]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.5, rotateY: -90 }}
      transition={{ duration: 0.8, delay, type: 'spring', stiffness: 100 }}
      className="text-center group cursor-pointer"
      whileHover={{ scale: 1.1, rotateY: 10 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Icône avec effet de pulsation */}
      <motion.div
        className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative overflow-hidden`}
        animate={{
          boxShadow: [
            `0 0 20px ${color.split('-')[1]}-500/30`,
            `0 0 40px ${color.split('-')[1]}-500/50`,
            `0 0 20px ${color.split('-')[1]}-500/30`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon className="w-10 h-10 text-white relative z-10" />
        
        {/* Effet de pulsation interne */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Valeur avec effet de compteur */}
      <motion.div
        className="text-4xl font-bold text-gray-900 mb-2"
        animate={{
          textShadow: [
            '0 0 10px rgba(0,0,0,0.1)',
            '0 0 20px rgba(0,0,0,0.2)',
            '0 0 10px rgba(0,0,0,0.1)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {displayValue}{suffix}
      </motion.div>
      
      {/* Label avec effet de révélation */}
      <motion.p
        className="text-gray-600 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
};

/**
 * Composant de modal avec effet de téléportation
 */
export const TeleportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop avec effet de déformation */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Modal content avec effet de téléportation */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ 
              opacity: 0, 
              scale: 0.5, 
              rotateX: -90,
              y: -100 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateX: 0,
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              rotateX: 90,
              y: 100 
            }}
            transition={{ 
              duration: 0.5,
              type: 'spring',
              stiffness: 200,
              damping: 25
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Header avec effet de brillance */}
            {title && (
              <motion.div 
                className="p-6 border-b border-gray-200 relative overflow-hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <h2 className="text-2xl font-bold text-gray-900 relative z-10">{title}</h2>
              </motion.div>
            )}
            
            {/* Content avec effet de révélation */}
            <motion.div 
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Composant de grille avec effet de cascade fluide
 */
export const FluidCascadeGrid: React.FC<{
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.1 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.2,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { 
              opacity: 0, 
              y: 50, 
              scale: 0.8,
              rotateX: -15 
            },
            visible: { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotateX: 0 
            },
          }}
          transition={{ 
            duration: 0.8, 
            type: 'spring',
            stiffness: 100,
            damping: 15
          }}
          whileHover={{
            y: -10,
            scale: 1.05,
            rotateY: 5,
            transition: { duration: 0.3 }
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Composant de texte avec effet de matrix
 */
export const MatrixText: React.FC<{
  text: string;
  className?: string;
  speed?: number;
}> = ({ text, className = '', speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className={className}>
      <span className="relative">
        {displayedText}
        {!isComplete && (
          <motion.span
            className="inline-block w-0.5 h-6 bg-green-500 ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </span>
    </div>
  );
};

/**
 * Composant de carte avec effet de glassmorphism avancé
 */
export const AdvancedGlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  blurIntensity?: number;
  opacity?: number;
}> = ({ children, className = '', blurIntensity = 20, opacity = 0.1 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02, rotateY: 2 }}
      transition={{ duration: 0.3 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Effet de glassmorphism avancé */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,${opacity * 2}) 0%, rgba(255,255,255,${opacity}) 50%, transparent 100%)`,
          backdropFilter: `blur(${blurIntensity}px)`,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      />
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Effet de brillance qui suit la souris */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};
