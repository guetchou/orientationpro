
import { useContext } from 'react';
import { AuthContext } from './useAuthContext';
import { AuthProvider } from './useAuthProvider';
import { ProfileData, AuthContextProps, User } from './useAuthTypes';

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-exporting everything for backward compatibility
export { AuthProvider };
export type { ProfileData, AuthContextProps, User };
