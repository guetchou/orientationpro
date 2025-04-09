
import { useAuth } from './useAuthContext';
import { AuthProvider } from './useAuthProvider';
import { ProfileData, AuthContextProps, User } from './useAuthTypes';

// Re-exporting everything for backward compatibility
export { useAuth, AuthProvider };
export type { ProfileData, AuthContextProps, User };
