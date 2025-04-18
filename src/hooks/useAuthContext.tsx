
import { createContext } from 'react';
import { AuthContextProps } from './useAuthTypes';

// Création du contexte d'authentification avec une valeur initiale undefined
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
