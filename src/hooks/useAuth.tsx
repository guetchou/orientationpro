
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'sonner';
import { useProfileData } from './useProfileData';
import { useAuthMethods } from './useAuthMethods';
import { useAdminMethods } from './useAdminMethods';

// Types for authentication
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Session {
  token: string;
  user: User;
}

// Create auth context
const AuthContext = createContext<ReturnType<typeof useAuthProvider> | undefined>(undefined);

// Provider hook that creates auth object and handles state
function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get profile data
  const { profileData, isSuperAdmin, isMasterAdmin, loading: profileLoading } = useProfileData(user);
  
  // Standard auth methods
  const authMethods = useAuthMethods();
  
  // Admin methods
  const adminMethods = useAdminMethods();

  useEffect(() => {
    console.log("Auth provider initialized");
    
    // Check if token exists in localStorage
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
          setSession({ token, user });
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    session,
    loading: loading || authMethods.loading || adminMethods.loading || profileLoading,
    error,
    isSuperAdmin,
    isMasterAdmin,
    profileData,
    ...authMethods,
    ...adminMethods
  };
}

// Context provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook for child components to get the auth object and re-render when it changes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
