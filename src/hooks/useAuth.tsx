
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useProfileData } from './useProfileData';
import { useAuthMethods } from './useAuthMethods';
import { useAdminMethods } from './useAdminMethods';

// Create auth context
const AuthContext = createContext<ReturnType<typeof useAuthProvider> | undefined>(undefined);

// Provider hook that creates auth object and handles state
function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Récupération des données de profil
  const { profileData, isSuperAdmin, isMasterAdmin, loading: profileLoading } = useProfileData(user);
  
  // Méthodes d'authentification standard
  const authMethods = useAuthMethods();
  
  // Méthodes d'administration
  const adminMethods = useAdminMethods();

  useEffect(() => {
    console.log("Auth provider initialized");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    // THEN check for existing session
    const checkAuth = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error('Erreur de vérification auth:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
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

// For backwards compatibility
export function useAuthStandalone() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Récupération des données de profil
  const { isSuperAdmin, isMasterAdmin } = useProfileData(user);
  
  // Méthodes d'authentification standard
  const authMethods = useAuthMethods();
  
  // Méthodes d'administration
  const adminMethods = useAdminMethods();

  useEffect(() => {
    // Vérifier l'état de l'authentification actuelle
    const checkAuth = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          throw authError;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error('Erreur de vérification auth:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    checkAuth();

    // Nettoyer la souscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading: loading || authMethods.loading || adminMethods.loading,
    error,
    isSuperAdmin,
    isMasterAdmin,
    ...authMethods,
    ...adminMethods
  };
}
