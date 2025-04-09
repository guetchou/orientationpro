
import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useAuthMethods } from './useAuthMethods';
import { User, ProfileData, AuthContextProps } from './useAuthTypes';
import { AuthContext } from './useAuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    created_at: '',
    phone: '',
    address: '',
    role: 'user'
  });
  const [session, setSession] = useState<Session | null>(null);
  const { loading: authLoading, signIn, signUp, signOut, resetPassword, updatePassword } = useAuthMethods();

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        if (session?.user) {
          await fetchProfileData(session.user.id);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      setSession(session || null);
      if (session?.user) {
        await fetchProfileData(session.user.id);
      } else {
        setProfileData({
          id: '',
          first_name: '',
          last_name: '',
          email: '',
          created_at: '',
          phone: '',
          address: '',
          role: 'user'
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile data:", error);
      } else if (data) {
        setProfileData({
          id: data.id,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          created_at: data.created_at || '',
          phone: data.phone || '',
          address: data.address || '',
          role: data.role || 'user'
        });
        
        setIsSuperAdmin(!!data.is_super_admin);
        setIsMasterAdmin(!!data.is_master_admin);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    try {
      setLoading(true);
      const updates = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updates);
        
      if (error) {
        throw error;
      }
      
      // Optimistically update state
      setProfileData((prevData) => ({
        ...prevData,
        ...data
      }));
    } catch (error) {
      console.error("Error updating the profile!", error);
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
            is_super_admin: true
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error creating super admin:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextProps = {
    user,
    loading: loading || authLoading,
    logout: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error("Error signing out:", error);
        return { success: false, error };
      }
    },
    profileData,
    session,
    isSuperAdmin,
    isMasterAdmin,
    updateProfile,
    signInWithGoogle: async () => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/profile`
          }
        });
        
        if (error) {
          console.error("Error signing in with Google:", error);
          return { success: false, error };
        }
        
        return { success: true, data };
      } catch (error) {
        console.error("Error signing in with Google:", error);
        return { success: false, error };
      }
    },
    signInWithGithub: async () => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/profile`
          }
        });
        
        if (error) {
          console.error("Error signing in with Github:", error);
          return { success: false, error };
        }
        
        return { success: true, data };
      } catch (error) {
        console.error("Error signing in with Github:", error);
        return { success: false, error };
      }
    },
    signIn,
    signUp,
    createSuperAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
