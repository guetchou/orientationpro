
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/themes.css';
import './styles/mobile.css';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from './components/errors/ErrorBoundary';

// Configuration des performances pour framer-motion
if (typeof window !== 'undefined') {
  // Désactiver les animations complexes sur les appareils moins puissants
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  if (isMobile || isLowPower) {
    document.documentElement.classList.add('reduce-motion');
  }
}

// Enregistrement du service worker PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Optimisations mobile
const optimizeMobileExperience = () => {
  // Désactiver le zoom par double-tap sur iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Optimiser le scroll sur mobile
  document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
  
  // Améliorer les performances de touch
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
};

// Appliquer les optimisations mobile
if ('ontouchstart' in window) {
  optimizeMobileExperience();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Logger l'erreur pour le monitoring
        console.error('Application error:', error, errorInfo);
        // Ici, on pourrait envoyer à Sentry ou autre service de monitoring
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
