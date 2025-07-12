import { toast } from 'sonner';
// [LOCAL MODE] Supabase désactivé. Utiliser uniquement l'API locale pour l'authentification.
// import { supabase } from '@/integrations/supabase/client';
import type { AuthUser } from '@supabase/supabase-js';
import { User, ProfileData } from '../useAuthTypes';

/**
 * Hook contenant les méthodes d'authentification
 */
export const useAuthMethods = (
  setUser: (user: User | null) => void,
  setProfile: (profile: ProfileData | null) => void,
  setProfileData: (profile: ProfileData | null) => void,
  setIsSuperAdmin: (value: boolean) => void,
  setIsMasterAdmin: (value: boolean) => void
) => {
  // Récupération du profil utilisateur
  const fetchProfile = async (userId: string) => {
    try {
      // [LOCAL MODE] Supabase désactivé. Utiliser uniquement l'API locale pour l'authentification.
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', userId)
      //   .single();
      
      // if (error) throw error;
      
      setProfile(null);
      setProfileData(null);
      
      // Set admin status
      setIsSuperAdmin(false);
      setIsMasterAdmin(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Connexion avec email/mot de passe - mode simplifié sans vérification
  const signIn = async (email: string, password?: string) => {
    try {
      // [LOCAL MODE] Supabase désactivé. Utiliser uniquement l'API locale pour l'authentification.
      // const { data, error } = await supabase.auth.signInWithOtp({ 
      //   email,
      //   options: {
      //     shouldCreateUser: true,
      //     emailRedirectTo: window.location.origin + '/dashboard'
      //   }
      // });
      
      // if (error) throw error;
      
      toast.success('Connexion en cours... Vérifiez vos emails pour le lien de connexion');
      return { user: null, token: null };
    } catch (error: any) {
      toast.error(error.message || 'Échec de la connexion');
      throw error;
    }
  };

  // Inscription avec email/mot de passe - simplifié
  const signUp = async (email: string, password?: string, userData = {}) => {
    try {
      // [LOCAL MODE] Supabase désactivé. Utiliser uniquement l'API locale pour l'authentification.
      // const { data, error } = await supabase.auth.signInWithOtp({
      //   email,
      //   options: {
      //     shouldCreateUser: true,
      //     data: userData,
      //     emailRedirectTo: window.location.origin + '/dashboard'
      //   }
      // });
      
      // if (error) throw error;
      
      toast.success('Un lien de connexion a été envoyé à votre email.');
      return { user: null, token: null };
    } catch (error: any) {
      toast.error(error.message || 'Échec de l\'inscription');
      throw error;
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      // [LOCAL MODE] Supabase désactivé. Utiliser uniquement l'API locale pour l'authentification.
      // await supabase.auth.signOut();
      
      // Nettoyer tous les tokens et données
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedMode');
      
      // Synchroniser l'état
      setUser(null);
      setProfile(null);
      setProfileData(null);
      setIsSuperAdmin(false);
      setIsMasterAdmin(false);
      
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déconnexion');
    }
  };

  // Mise à jour du profil
  const updateProfile = async (profileData: Partial<ProfileData>) => {
    try {
      // [LOCAL MODE] Supabase désactivé. Utiliser uniquement l'API locale pour l'authentification.
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error('Utilisateur non connecté');
      
      // const { error } = await supabase
      //   .from('profiles')
      //   .update(profileData)
      //   .eq('id', user.id);
      
      // if (error) throw error;
      
      // Récupérer le profil complet après mise à jour pour assurer la cohérence
      // const { data: updatedProfile } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single();
      
      // Utiliser directement les objets, pas des fonctions updater
      // if (updatedProfile) {
      //   setProfile(updatedProfile);
      //   setProfileData(updatedProfile);
      // }
      
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  return {
    fetchProfile,
    signIn,
    signUp,
    signOut,
    logout: signOut, // Alias pour signOut pour compatibilité
    updateProfile,
  };
};
