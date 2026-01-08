import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Arrière-plan optimisé avec moins de particules
 */
export const OptimizedBackground: React.FC = () => {
  // Réduire le nombre de particules pour améliorer les performances
  const particles = React.useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
  }, []);

  const shapes = React.useMemo(() => {
    return [...Array(4)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      borderRadius: Math.random() > 0.5 ? '50%' : '20%',
      duration: 20 + Math.random() * 10,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Particules optimisées */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Formes géométriques optimisées */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute bg-gradient-to-br from-blue-500/10 to-purple-500/10"
          style={{
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            width: `${shape.width}px`,
            height: `${shape.height}px`,
            borderRadius: shape.borderRadius,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Gradient animé simplifié */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

/**
 * Particules interactives optimisées
 */
export const OptimizedParticles: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 30, className = '' }) => {
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
      vx: (Math.random() - 0.5) * 1, // Réduire la vitesse
      vy: (Math.random() - 0.5) * 1,
      size: Math.random() * 2 + 1, // Réduire la taille
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

    // Réduire la fréquence d'animation
    const interval = setInterval(animate, 32); // 30fps au lieu de 60fps
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};

