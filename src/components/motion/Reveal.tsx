import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Wrapper de révélation au défilement, partagé entre les pages.
 * Respecte prefers-reduced-motion : rend un simple <div> statique
 * au lieu d'animer quand l'utilisateur a demandé moins de mouvement.
 */
export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
};
