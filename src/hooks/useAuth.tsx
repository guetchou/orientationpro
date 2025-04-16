
import { useAuth as useAuthHook } from './useAuthContext';
import { AuthProvider } from './useAuthProvider';
import { ProfileData, AuthContextProps, User } from './useAuthTypes';

// Re-exporting everything for backward compatibility
export { useAuthHook as useAuth, AuthProvider };
export type { ProfileData, AuthContextProps, User };
