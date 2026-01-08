import { useWebVitalsConsole } from '@/hooks/useWebVitals';

/**
 * Composant pour monitorer les Web Vitals
 * À utiliser dans App.tsx ou main.tsx
 */
export function WebVitalsMonitor() {
  useWebVitalsConsole();
  return null; // Composant silencieux, uniquement pour les side effects
}

