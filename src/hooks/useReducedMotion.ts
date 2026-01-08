import { useEffect, useState } from 'react';

/**
 * Hook pour détecter la préférence de mouvement réduit de l'utilisateur
 * et améliorer les performances en désactivant les animations complexes
 */
export const useReducedMotion = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur préfère réduire les animations
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Détection initiale
    setShouldReduceMotion(mediaQuery.matches);

    // Écouter les changements
    const handleChange = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return shouldReduceMotion;
};

/**
 * Fonction utilitaire pour obtenir des variants d'animation optimisés
 * selon la préférence de mouvement de l'utilisateur
 */
export const getOptimizedVariants = (shouldReduceMotion: boolean) => {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };
};

