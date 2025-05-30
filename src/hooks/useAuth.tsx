
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Export User type to fix the error in useAuthMethods
export type User = {
  id: string;
  email?: string; // Changed to optional to match Supabase User
  photoURL?: string;
  displayName?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: object) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  updateProfile: (data: object) => Promise<any>;
  isMasterAdmin?: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          const userData: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
          };
          setUser(userData);
          
          // Defer profile fetch to prevent potential deadlocks
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const userData: User = {
          id: currentSession.user.id,
          email: currentSession.user.email || '',
        };
        setUser(userData);
        
        fetchProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      setProfile(data);
      
      // Check if user is super admin
      if (data?.is_super_admin) {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la connexion');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsSuperAdmin(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déconnexion');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe');
      throw error;
    }
  };

  const updateProfile = async (profileData: object) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      fetchProfile(user.id);
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    isSuperAdmin,
    isMasterAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
