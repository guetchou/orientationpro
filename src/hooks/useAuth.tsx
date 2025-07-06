import { useContext } from 'react';
import { AuthContext } from './useAuthContext';
import { AuthContextProps } from './useAuthTypes';
import { AuthProvider } from './useAuthProvider';

// Hook pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export du provider pour l'utiliser dans App.tsx
export { AuthProvider };

// Export des types pour compatibilité
export type { User, ProfileData, AuthContextProps } from './useAuthTypes'; 