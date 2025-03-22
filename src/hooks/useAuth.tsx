
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  useEffect(() => {
    // Vérifier l'état de l'authentification actuelle
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }

        setUser(currentUser);
        
        // Vérifier si l'utilisateur est un super admin ou master admin
        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('department, is_super_admin, is_master_admin')
            .eq('id', currentUser.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profileData) {
            setIsSuperAdmin(profileData.is_super_admin || false);
            setIsMasterAdmin(profileData.is_master_admin || false);
          }
        }
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
      
      // Vérifier si l'utilisateur est un super admin ou master admin lors des changements d'état d'authentification
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('department, is_super_admin, is_master_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsSuperAdmin(false);
          setIsMasterAdmin(false);
        } else if (profileData) {
          setIsSuperAdmin(profileData.is_super_admin || false);
          setIsMasterAdmin(profileData.is_master_admin || false);
        } else {
          setIsSuperAdmin(false);
          setIsMasterAdmin(false);
        }
      } else {
        setIsSuperAdmin(false);
        setIsMasterAdmin(false);
      }
      
      setLoading(false);
    });

    checkAuth();

    // Nettoyer la souscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        toast.success('Connexion réussie !');
      }
      
      return data;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      toast.error("Erreur lors de la connexion");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      if (data.user) {
        toast.success('Inscription réussie ! Veuillez vérifier votre email.');
      }
      
      return data;
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      toast.error("Erreur lors de l'inscription");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Déconnexion réussie');
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      toast.error('Erreur lors de la déconnexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Email de réinitialisation envoyé !');
    } catch (err) {
      console.error('Erreur de réinitialisation du mot de passe:', err);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success('Mot de passe mis à jour avec succès');
    } catch (err) {
      console.error('Erreur de mise à jour du mot de passe:', err);
      toast.error('Erreur lors de la mise à jour du mot de passe');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      // Créer un nouvel utilisateur
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Mettre à jour le profil pour indiquer qu'il s'agit d'un super admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            department: 'admin',
            is_super_admin: true,
            first_name: firstName,
            last_name: lastName,
            status: 'active',
          })
          .eq('id', data.user.id);

        if (profileError) throw profileError;
        
        toast.success('Compte super admin créé avec succès !');
      }
      
      return data;
    } catch (err) {
      console.error("Erreur lors de la création du super admin:", err);
      toast.error("Erreur lors de la création du super admin");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const createMasterAdmin = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      // Créer un nouvel utilisateur
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Mettre à jour le profil pour indiquer qu'il s'agit d'un master admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            department: 'admin',
            is_super_admin: true,
            is_master_admin: true,
            first_name: firstName,
            last_name: lastName,
            status: 'active',
          })
          .eq('id', data.user.id);

        if (profileError) throw profileError;
        
        toast.success('Compte master admin créé avec succès !');
      }
      
      return data;
    } catch (err) {
      console.error("Erreur lors de la création du master admin:", err);
      toast.error("Erreur lors de la création du master admin");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isSuperAdmin,
    isMasterAdmin,
    createSuperAdmin,
    createMasterAdmin,
  };
}
