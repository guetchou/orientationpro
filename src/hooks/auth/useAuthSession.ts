
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '../useAuthTypes';

/**
 * Hook pour gérer la session d'authentification
 */
export const useAuthSession = (
  setUser: (user: User | null) => void,
  setProfile: (profile: null) => void,
  setProfileData: (profile: null) => void,
  setIsSuperAdmin: (value: boolean) => void,
  setIsMasterAdmin: (value: boolean) => void,
  setLoading: (loading: boolean) => void,
  fetchProfile: (userId: string) => Promise<void>
) => {
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
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
};
