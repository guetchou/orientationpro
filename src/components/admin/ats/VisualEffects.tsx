import React from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface VisualEffectsProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const FadeInUp: React.FC<VisualEffectsProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'up',
  className = '' 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const PulseAnimation: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const RotateAnimation: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const BounceAnimation: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ShakeAnimation: React.FC<{ children: React.ReactNode; className?: string; trigger?: boolean }> = ({ 
  children, 
  className = '',
  trigger = false 
}) => {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0]
      } : {}}
      transition={{
        duration: 0.5,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const GlowEffect: React.FC<{ children: React.ReactNode; className?: string; color?: string }> = ({ 
  children, 
  className = '',
  color = 'blue'
}) => {
  const glowColors = {
    blue: 'shadow-blue-500/50',
    green: 'shadow-green-500/50',
    purple: 'shadow-purple-500/50',
    red: 'shadow-red-500/50',
    yellow: 'shadow-yellow-500/50'
  };

  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 20px rgba(59, 130, 246, 0.5)`,
        scale: 1.02
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`${className} ${glowColors[color as keyof typeof glowColors]}`}
    >
      {children}
    </motion.div>
  );
};

export const ProgressBar: React.FC<{ 
  progress: number; 
  className?: string;
  animated?: boolean;
}> = ({ 
  progress, 
  className = '',
  animated = true 
}) => {
  return (
    <motion.div
      className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: animated ? 1 : 0,
          ease: "easeOut"
        }}
      />
    </motion.div>
  );
};

export const CountUp: React.FC<{ 
  end: number; 
  duration?: number;
  className?: string;
}> = ({ 
  end, 
  duration = 2,
  className = '' 
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <span className={className}>
      {count.toLocaleString()}
    </span>
  );
};

export const Typewriter: React.FC<{ 
  text: string; 
  speed?: number;
  className?: string;
}> = ({ 
  text, 
  speed = 50,
  className = '' 
}) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        |
      </motion.span>
    </span>
  );
};
