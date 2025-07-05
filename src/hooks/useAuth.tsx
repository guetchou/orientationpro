
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  role?: string;
  displayName?: string;
  photoURL?: string;
}

export interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
  is_super_admin?: boolean;
  is_master_admin?: boolean;
  interests?: string;
  experience?: string;
  education?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isMasterAdmin: boolean;
  signIn: (email: string, password?: string) => Promise<any>;
  signUp: (email: string, password?: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      setIsSuperAdmin(data?.is_super_admin || false);
      setIsMasterAdmin(data?.is_master_admin || false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Sign in method - simplified to work with both Supabase and backend
  const signIn = async (email: string, password?: string) => {
    try {
      setLoading(true);
      
      // Try with Supabase first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || ''
      });
      
      if (error) {
        // If Supabase fails, try backend for admin login
        if (email.includes('admin')) {
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email, 
              password, 
              role: 'admin' 
            })
          });

          if (response.ok) {
            const result = await response.json();
            localStorage.setItem('adminToken', result.token);
            localStorage.setItem('adminUser', JSON.stringify(result.user));
            
            setUser({
              id: result.user.id,
              email: result.user.email,
              role: result.user.role,
              displayName: `${result.user.firstName} ${result.user.lastName}`
            });
            
            toast.success('Connexion admin réussie!');
            return { user: result.user, token: result.token };
          } else {
            throw new Error('Connexion backend échouée');
          }
        } else {
          throw error;
        }
      } else {
        // Supabase login successful
        const supabaseUser = data.user;
        if (supabaseUser) {
          const userData: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            displayName: supabaseUser.user_metadata?.display_name,
            photoURL: supabaseUser.user_metadata?.avatar_url
          };
          
          setUser(userData);
          await fetchProfile(supabaseUser.id);
          toast.success('Connexion réussie!');
          return { user: userData };
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Erreur de connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up method
  const signUp = async (email: string, password?: string, userData = {}) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
          data: userData
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          displayName: (userData as any).firstName && (userData as any).lastName 
            ? `${(userData as any).firstName} ${(userData as any).lastName}` 
            : undefined
        };
        
        setUser(newUser);
        toast.success('Inscription réussie! Vérifiez vos emails.');
        return { user: newUser };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Erreur d\'inscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      // Clear admin tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      setUser(null);
      setProfile(null);
      setIsSuperAdmin(false);
      setIsMasterAdmin(false);
      
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Update profile method
  const updateProfile = async (profileData: Partial<ProfileData>) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      await fetchProfile(user.id);
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  // Refresh profile method
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Check for admin session first
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminToken && adminUser) {
      try {
        const userData = JSON.parse(adminUser);
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          displayName: `${userData.firstName} ${userData.lastName}`
        });
        setIsSuperAdmin(userData.isAdmin || false);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing admin user:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }

    // Handle Supabase auth
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.display_name,
          photoURL: session.user.user_metadata?.avatar_url
        };
        
        setUser(userData);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name,
            photoURL: session.user.user_metadata?.avatar_url
          };
          
          setUser(userData);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsSuperAdmin(false);
          setIsMasterAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isLoading: loading,
    isSuperAdmin,
    isMasterAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
