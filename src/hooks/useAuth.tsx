import { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthChangeEvent,
  Session,
  User,
} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<{ success: boolean; error?: any }>;
  profileData: ProfileData;
  session: Session | null;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
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

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
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
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Do not return the value after inserting
      });

      if (error) {
        throw error;
      }

      // Optimistically update state
      setProfileData((prevData) => ({
        ...prevData,
        ...data,
      }));
    } catch (error) {
      console.error("Error updating the profile!", error);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      // Add your logout logic here
      // For example, using Supabase:
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
          redirectTo: `${window.location.origin}/profile`,
        },
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
          redirectTo: `${window.location.origin}/profile`,
        },
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
    updateProfile,
    signInWithGoogle,
    signInWithGithub,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
