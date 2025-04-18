
import React, { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, ProfileData, AuthContextProps } from './useAuthTypes';
import { AuthContext } from './useAuthContext';
import { toast } from 'sonner';

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Authentification initiale
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'user',
            displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            photoURL: session.user.user_metadata?.avatar_url
          };
          setUser(userData);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'user',
            displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            photoURL: session.user.user_metadata?.avatar_url
          };
          setUser(userData);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setProfileData(null);
          setIsSuperAdmin(false);
          setIsMasterAdmin(false);
        }
        setLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Récupération du profil utilisateur
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      setProfileData(data);
      
      // Set admin status
      setIsSuperAdmin(data?.is_super_admin || false);
      setIsMasterAdmin(data?.is_master_admin || false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Connexion avec email/mot de passe
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Connexion réussie');
      return { user: data.user, token: data.session };
    } catch (error: any) {
      toast.error(error.message || 'Échec de la connexion');
      throw error;
    }
  };

  // Inscription avec email/mot de passe
  const signUp = async (email: string, password: string, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData }
      });
      
      if (error) throw error;
      
      toast.success('Inscription réussie! Vérifiez votre email pour confirmer votre compte.');
      return { user: data.user, token: data.session };
    } catch (error: any) {
      toast.error(error.message || 'Échec de l\'inscription');
      throw error;
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déconnexion');
    }
  };

  // Alias pour signOut pour compatibilité
  const logout = signOut;

  // Mise à jour du profil
  const updateProfile = async (profileData: Partial<ProfileData>) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      setProfileData(prev => prev ? { ...prev, ...profileData } : null);
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  const value: AuthContextProps = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id),
    logout,
    profileData: profileData || undefined,
    isSuperAdmin,
    isMasterAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
