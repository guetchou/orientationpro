import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const OnlineStatus = () => {
  const { isOnline } = usePWA();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setShowOfflineMessage(true);
      
      // Masquer le message après 3 secondes
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (hasBeenOffline) {
      // Afficher brièvement le message de reconnexion
      setShowOfflineMessage(true);
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 mx-4 mt-4"
        >
          <div
            className={`
              flex items-center justify-center p-3 rounded-lg shadow-lg
              ${isOnline 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5" />
                  <span className="font-medium">Connexion rétablie</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5" />
                  <span className="font-medium">Mode hors ligne</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Indicateur permanent pour le mode hors ligne */}
      {!isOnline && !showOfflineMessage && (
        <div className="fixed bottom-20 left-4 z-40">
          <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg">
            <CloudOff className="h-4 w-4" />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
