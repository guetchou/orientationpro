import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Bannière affichée quand l'utilisateur est hors ligne
 */
export function OfflineBanner() {
  const { isOffline } = useOffline({ showNotification: false });

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 p-4"
        >
          <Alert variant="destructive" className="max-w-4xl mx-auto shadow-lg">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Mode hors ligne</AlertTitle>
            <AlertDescription>
              Vous n'êtes pas connecté à Internet. Certaines fonctionnalités peuvent être limitées.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Indicateur de statut de connexion (petit badge)
 */
export function ConnectionStatus() {
  const { isOnline } = useOffline({ showNotification: false });

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">En ligne</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-muted-foreground">Hors ligne</span>
        </>
      )}
    </div>
  );
}

