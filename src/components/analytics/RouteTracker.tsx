import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/services/analytics/FrontendAnalytics';

/**
 * Composant pour tracker automatiquement les changements de route
 * À utiliser dans AppRouter
 */
export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view quand la route change
    trackPageView(location.pathname, document.title);
  }, [location]);

  return null; // Composant silencieux
}

