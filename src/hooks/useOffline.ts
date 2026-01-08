import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineOptions {
  showNotification?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
}

/**
 * Hook pour détecter et gérer l'état de connexion réseau
 */
export function useOffline(options: OfflineOptions = {}) {
  const {
    showNotification = true,
    onOnline,
    onOffline,
  } = options;

  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  });

  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    
    if (wasOffline && showNotification) {
      toast.success('Connexion rétablie', {
        description: 'Vous êtes de nouveau en ligne',
      });
    }

    if (onOnline) {
      onOnline();
    }
    
    setWasOffline(false);
  }, [wasOffline, showNotification, onOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
    
    if (showNotification) {
      toast.warning('Mode hors ligne', {
        description: 'Vérification de votre connexion...',
        duration: 5000,
      });
    }

    if (onOffline) {
      onOffline();
    }
  }, [showNotification, onOffline]);

  useEffect(() => {
    // Écouter les événements de changement d'état réseau
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier périodiquement la connexion
    const checkConnection = async () => {
      try {
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        
        if (!response.ok && !isOnline) {
          handleOffline();
        } else if (isOnline) {
          handleOnline();
        }
      } catch (error) {
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Vérifier la connexion toutes les 30 secondes
    const intervalId = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [handleOnline, handleOffline, isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

/**
 * Hook pour gérer les données mises en cache pendant l'offline
 */
export function useOfflineData<T>(key: string) {
  const { isOnline } = useOffline({ showNotification: false });
  const [cachedData, setCachedData] = useState<T | null>(null);

  // Charger les données depuis le cache local
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        setCachedData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }, [key]);

  // Sauvegarder les données dans le cache local
  const saveOfflineData = useCallback((data: T) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(data));
      setCachedData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }, [key]);

  // Nettoyer les données en cache
  const clearOfflineData = useCallback(() => {
    try {
      localStorage.removeItem(`offline_${key}`);
      setCachedData(null);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }, [key]);

  return {
    cachedData,
    saveOfflineData,
    clearOfflineData,
    isOnline,
  };
}

