import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà refusé l'installation
    const hasBeenDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (hasBeenDismissed) {
      setDismissed(true);
    }

    // Afficher le prompt après un délai si installable
    if (isInstallable && !isInstalled && !hasBeenDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Attendre 10 secondes

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_prompt_dismissed', {
        event_category: 'PWA',
        event_label: 'Prompt Dismissed'
      });
    }
  };

  const handleShowAgain = () => {
    localStorage.removeItem('pwa-prompt-dismissed');
    setDismissed(false);
    setShowPrompt(true);
  };

  // Si installé, afficher un indicateur discret
  if (isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
          <Smartphone className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // Bouton discret pour réafficher le prompt si dismissé
  if (dismissed && isInstallable) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShowAgain}
          className="shadow-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Installer l'app
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {showPrompt && isInstallable && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <Card className="p-4 shadow-xl border-blue-200 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Installer l'application
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Installez OrientationPro pour un accès rapide et une meilleure expérience, même hors ligne !
            </p>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleInstall}
                className="flex-1"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Installer
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                size="sm"
              >
                Plus tard
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              ✓ Accès hors ligne • ✓ Notifications • ✓ Installation rapide
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
