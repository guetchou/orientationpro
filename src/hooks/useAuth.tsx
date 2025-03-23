import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  photoURL?: string;
  displayName?: string;
}

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  phone: string;
  address: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  session: Session | null;
  profileData: ProfileData;
  isSuperAdmin: boolean;
  isMasterAdmin: boolean;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  logout: () => Promise<{ success: boolean; error?: any }>;
  signInWithGoogle: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signInWithGithub: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  createSuperAdmin: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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

    supabase.auth.onAuthStateChange(async (event, session) => {
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
  }, []);

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
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
      const { error } = await supabase.from('profiles').upsert(updates);
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

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: userData?.firstName || '',
            last_name: userData?.lastName || '',
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
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
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error };
    }
  };

  const signInWithGoogle = async () => {
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
  };

  const signInWithGithub = async () => {
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
  };

  const value = {
    user,
    loading,
    logout,
    profileData,
    session,
    isSuperAdmin,
    isMasterAdmin,
    updateProfile,
    signInWithGoogle,
    signInWithGithub,
    signIn,
    signUp,
    createSuperAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the types for other components that need them
export type { ProfileData, AuthContextProps, User };
