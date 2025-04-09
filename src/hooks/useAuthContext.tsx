
import { createContext, useContext } from 'react';
import { AuthContextProps } from './useAuthTypes';

// Création du contexte d'authentification
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
