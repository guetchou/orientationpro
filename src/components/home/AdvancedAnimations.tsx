import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useAnimation } from 'framer-motion';

/**
 * Composant avec effet de morphing 3D
 */
export const Morphing3DCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  morphTargets?: string[];
}> = ({ children, className = '', morphTargets = [] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentMorph, setCurrentMorph] = useState(0);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setCurrentMorph((prev) => (prev + 1) % morphTargets.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHovered, morphTargets.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Effet de morphing en arrière-plan */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          background: isHovered ? morphTargets[currentMorph] : morphTargets[0],
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      
      {/* Contenu avec effet de profondeur */}
      <motion.div
        className="relative z-10"
        style={{
          transform: 'translateZ(50px)',
        }}
      >
        {children}
      </motion.div>
      
      {/* Effet de brillance 3D */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0"
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
          transform: 'translateZ(25px)',
        }}
      />
    </motion.div>
  );
};

/**
 * Composant de texte avec effet de liquide
 */
export const LiquidText: React.FC<{
  text: string;
  className?: string;
  delay?: number;
}> = ({ text, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isInView && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100 + Math.random() * 50);
      return () => clearTimeout(timer);
    }
  }, [isInView, currentIndex, text]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, delay }}
    >
      <span className="relative">
        {displayedText.split('').map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ y: 20, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.05,
              type: 'spring',
              stiffness: 200,
            }}
            style={{ transformOrigin: 'bottom' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
        <motion.span
          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={isInView ? { width: '100%' } : { width: 0 }}
          transition={{ duration: 1, delay: delay + 0.5 }}
        />
      </span>
    </motion.div>
  );
};

/**
 * Composant de particules interactives
 */
export const InteractiveParticles: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 100, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * (containerRef.current?.offsetWidth || 1000),
      y: Math.random() * (containerRef.current?.offsetHeight || 600),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 1,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }));
    setParticles(newParticles);
  }, [count]);

  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        let newVx = particle.vx;
        let newVy = particle.vy;

        // Rebond sur les bords
        if (newX <= 0 || newX >= (containerRef.current?.offsetWidth || 1000)) {
          newVx = -newVx;
          newX = Math.max(0, Math.min(newX, containerRef.current?.offsetWidth || 1000));
        }
        if (newY <= 0 || newY >= (containerRef.current?.offsetHeight || 600)) {
          newVy = -newVy;
          newY = Math.max(0, Math.min(newY, containerRef.current?.offsetHeight || 600));
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      }));
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Composant de grille hexagonale interactive
 */
export const HexagonalGrid: React.FC<{
  children: React.ReactNode[];
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {children.map((child, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={{ opacity: 0, scale: 0, rotateY: -180 }}
            animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0, rotateY: -180 }}
            transition={{
              duration: 0.8,
              delay: index * 0.1,
              type: 'spring',
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.1,
              rotateY: 10,
              z: 50,
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Effet hexagonal */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl transform rotate-45 scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                {child}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Composant de curseur personnalisé
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-difference"
      animate={{
        x: mousePosition.x - 12,
        y: mousePosition.y - 12,
        scale: isHovering ? 1.5 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 28,
      }}
    >
      <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
      <motion.div
        className="absolute inset-0 bg-white rounded-full"
        animate={{
          scale: isHovering ? 0.5 : 1,
          opacity: isHovering ? 0.5 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

/**
 * Composant de loading avec effet de vortex
 */
export const VortexLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-16 h-16">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1 + i * 0.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              borderTopColor: ['#3b82f6', '#8b5cf6', '#ec4899'][i],
            }}
          />
        ))}
        <motion.div
          className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
};

/**
 * Composant de texte avec effet de glitch
 */
export const GlitchText: React.FC<{
  text: string;
  className?: string;
  glitchIntensity?: number;
}> = ({ text, className = '', glitchIntensity = 0.1 }) => {
  const [glitch, setGlitch] = useState({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < glitchIntensity) {
        setIsGlitching(true);
        setGlitch({
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
        });
        
        setTimeout(() => {
          setIsGlitching(false);
          setGlitch({ x: 0, y: 0 });
        }, 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [glitchIntensity]);

  return (
    <div className={`relative ${className}`}>
      <motion.span
        className="block"
        animate={{
          x: glitch.x,
          y: glitch.y,
        }}
        transition={{ duration: 0.1 }}
      >
        {text}
      </motion.span>
      
      {isGlitching && (
        <>
          <motion.span
            className="absolute inset-0 text-red-500 opacity-70"
            animate={{ x: glitch.x + 2, y: glitch.y - 2 }}
            transition={{ duration: 0.1 }}
          >
            {text}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-blue-500 opacity-70"
            animate={{ x: glitch.x - 2, y: glitch.y + 2 }}
            transition={{ duration: 0.1 }}
          >
            {text}
          </motion.span>
        </>
      )}
    </div>
  );
};
