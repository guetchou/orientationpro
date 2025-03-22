
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuthMethods() {
  const [loading, setLoading] = useState(false);

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

  return {
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };
}
