
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useProfileData } from './useProfileData';
import { useAuthMethods } from './useAuthMethods';
import { useAdminMethods } from './useAdminMethods';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
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
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }

        setUser(currentUser);
      } catch (err) {
        console.error('Erreur de vérification auth:', err);
        setError(err as Error);
        toast.error("Erreur lors de la vérification de l'authentification");
      } finally {
        setLoading(false);
      }
    };

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
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
    loading: loading || authMethods.loading || adminMethods.loading,
    error,
    isSuperAdmin,
    isMasterAdmin,
    ...authMethods,
    ...adminMethods
  };
}
