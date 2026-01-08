import { useEffect } from 'react';

export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

/**
 * Hook pour collecter les Web Vitals (Core Web Vitals)
 * Mesure les performances réelles des utilisateurs
 */
export function useWebVitals(onReport?: (metric: WebVitalMetric) => void) {
  useEffect(() => {
    // Fonction pour calculer le rating
    const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
      const thresholds: Record<string, [number, number]> = {
        'CLS': [0.1, 0.25],
        'FID': [100, 300],
        'FCP': [1800, 3000],
        'LCP': [2500, 4000],
        'TTFB': [800, 1800],
        'INP': [200, 500],
      };

      const [good, poor] = thresholds[name] || [0, Infinity];
      
      if (value <= good) return 'good';
      if (value <= poor) return 'needs-improvement';
      return 'poor';
    };

    // Fonction pour reporter une métrique
    const reportMetric = (metric: any) => {
      const webVitalMetric: WebVitalMetric = {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: getRating(metric.name, metric.value),
        navigationType: metric.navigationType || 'navigate',
      };

      // Appeler le callback si fourni
      if (onReport) {
        onReport(webVitalMetric);
      }

      // Envoyer à l'analytics (stockage local)
      sendToAnalytics(webVitalMetric);

      // Logger en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', webVitalMetric);
      }
    };

    // Logger les métriques (stockage local uniquement)
    const sendToAnalytics = async (metric: WebVitalMetric) => {
      try {
        // Stocker dans localStorage
        const storedMetrics = JSON.parse(localStorage.getItem('web_vitals') || '[]');
        const newMetric = {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          navigation_type: metric.navigationType,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        };
        
        storedMetrics.push(newMetric);
        
        // Limiter à 100 métriques
        if (storedMetrics.length > 100) {
          storedMetrics.shift();
        }
        
        localStorage.setItem('web_vitals', JSON.stringify(storedMetrics));
      } catch (error) {
        console.error('Error storing web vital:', error);
      }
    };

    // Mesurer CLS (Cumulative Layout Shift)
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];

          if (
            !firstSessionEntry ||
            entry.startTime - lastSessionEntry.startTime > 1000 ||
            entry.startTime - firstSessionEntry.startTime > 5000
          ) {
            clsEntries = [entry as PerformanceEntry];
            clsValue = (entry as any).value;
          } else {
            clsEntries.push(entry as PerformanceEntry);
            clsValue += (entry as any).value;
          }
        }
      }
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });

      // Reporter CLS avant de quitter la page
      const reportCLS = () => {
        if (clsValue > 0) {
          reportMetric({
            name: 'CLS',
            value: clsValue,
            id: 'cls-' + Date.now(),
            delta: clsValue,
          });
        }
      };

      // Reporter CLS avant le déchargement de la page
      window.addEventListener('beforeunload', reportCLS);
      window.addEventListener('pagehide', reportCLS);

      // Mesurer FCP (First Contentful Paint)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            reportMetric({
              name: 'FCP',
              value: entry.startTime,
              id: 'fcp-' + Date.now(),
              delta: entry.startTime,
            });
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Mesurer LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        reportMetric({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          id: 'lcp-' + Date.now(),
          delta: lastEntry.renderTime || lastEntry.loadTime,
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Mesurer TTFB (Time to First Byte)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            reportMetric({
              name: 'TTFB',
              value: ttfb,
              id: 'ttfb-' + Date.now(),
              delta: ttfb,
            });
          }
        }
      }).observe({ entryTypes: ['navigation'] });

      // Nettoyage
      const cleanup = () => {
        observer.disconnect();
        window.removeEventListener('beforeunload', reportCLS);
        window.removeEventListener('pagehide', reportCLS);
      };

      // Retourner la fonction de nettoyage
      return cleanup;
    } catch (error) {
      console.error('Error setting up Web Vitals:', error);
      // Retourner une fonction vide si erreur
      return () => {};
    }
  }, [onReport]);
}

/**
 * Hook simple pour afficher les Web Vitals dans la console
 */
export function useWebVitalsConsole() {
  useWebVitals((metric) => {
    console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
  });
}

