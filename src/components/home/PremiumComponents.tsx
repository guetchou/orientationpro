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
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Composant de carte premium avec effets visuels avancés
 */
export const PremiumCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
}> = ({ children, className = '', glowColor = 'blue', hoverEffect = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const glowColors = {
    blue: 'shadow-blue-500/25',
    purple: 'shadow-purple-500/25',
    green: 'shadow-green-500/25',
    pink: 'shadow-pink-500/25',
    orange: 'shadow-orange-500/25',
  };

  return (
    <motion.div
      className={`relative group ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={hoverEffect ? { y: -8, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {/* Effet de lueur */}
      <motion.div
        className={`absolute -inset-1 bg-gradient-to-r from-${glowColor}-600 to-${glowColor}-400 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300`}
        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
      />
      
      {/* Carte principale */}
      <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Effet de brillance */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
        />
        
        {children}
      </Card>
    </motion.div>
  );
};

/**
 * Composant de témoignage avec animation de citation
 */
export const AnimatedTestimonial: React.FC<{
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
  rating: number;
  delay?: number;
}> = ({ name, role, company, quote, avatar, rating, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -15 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative"
    >
      <PremiumCard glowColor="purple" className="h-full">
        <CardContent className="p-8">
          {/* Avatar animé */}
          <motion.div
            className="flex items-center mb-6"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">{name}</h4>
              <p className="text-sm text-gray-600">{role}</p>
              <p className="text-xs text-gray-500">{company}</p>
            </div>
          </motion.div>

          {/* Étoiles animées */}
          <motion.div
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.4 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                transition={{ duration: 0.3, delay: delay + 0.5 + i * 0.1 }}
              >
                <Star 
                  className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Citation avec effet de révélation */}
          <motion.blockquote
            className="text-gray-700 italic text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: delay + 0.6 }}
          >
            "{quote}"
          </motion.blockquote>
        </CardContent>
      </PremiumCard>
    </motion.div>
  );
};

/**
 * Composant de module avec animation interactive
 */
export const InteractiveModule: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  link: string;
  stats: string;
  color: string;
  delay?: number;
}> = ({ title, description, icon: Icon, features, link, stats, color, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isHovered, setIsHovered] = useState(false);

  const colorVariants = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, rotateY: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 100, rotateY: -15 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <PremiumCard glowColor={color} className="h-full">
        <CardHeader className="relative pb-4">
          {/* Icône animée */}
          <motion.div
            className="flex items-center justify-between mb-4"
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${colorVariants[color]} rounded-2xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <Badge className={`bg-${color}-100 text-${color}-700 border-${color}-200`}>
              {stats}
            </Badge>
          </motion.div>
          
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </CardTitle>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Fonctionnalités avec animation */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: delay + 0.2 + index * 0.1 }}
              >
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Bouton CTA avec effet magnétique */}
          <motion.div
            className="mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              asChild
              className={`w-full bg-gradient-to-r ${colorVariants[color]} hover:shadow-lg transition-all duration-300 text-white font-semibold py-3`}
            >
              <a href={link}>
                Découvrir
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </CardContent>
      </PremiumCard>
    </motion.div>
  );
};

/**
 * Composant de statistique avec animation de compteur
 */
export const AnimatedStat: React.FC<{
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  color: string;
  delay?: number;
}> = ({ icon: Icon, value, label, suffix = '', color, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.5, rotateY: -90 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="text-center group"
    >
      <motion.div
        className={`w-20 h-20 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-10 h-10 text-white" />
      </motion.div>
      
      <motion.div
        className="text-4xl font-bold text-gray-900 mb-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        {value}{suffix}
      </motion.div>
      
      <motion.p
        className="text-gray-600 font-medium"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.5 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
};

/**
 * Composant de vidéo avec contrôles premium
 */
export const PremiumVideoPlayer: React.FC<{
  src: string;
  poster?: string;
  className?: string;
}> = ({ src, poster, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
      />
      
      {/* Overlay avec contrôles */}
      <motion.div
        className="absolute inset-0 bg-black/20 flex items-center justify-center"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={togglePlay}
            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-gray-800" />
            ) : (
              <Play className="w-8 h-8 text-gray-800 ml-1" />
            )}
          </motion.button>
          
          <motion.button
            onClick={toggleMute}
            className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-gray-800" />
            ) : (
              <Volume2 className="w-6 h-6 text-gray-800" />
            )}
          </motion.button>
          
          <motion.button
            onClick={toggleFullscreen}
            className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6 text-gray-800" />
            ) : (
              <Maximize className="w-6 h-6 text-gray-800" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Composant de modal premium avec animations
 */
export const PremiumModal: React.FC<{
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal content */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              </div>
            )}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
