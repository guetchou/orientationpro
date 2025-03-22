
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuthMethods() {
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting to sign in with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur de connexion:', error);
        toast.error(error.message === "Invalid login credentials" 
          ? "Email ou mot de passe incorrect" 
          : error.message);
        throw error;
      }
      
      if (data.user) {
        toast.success('Connexion réussie !');
      }
      
      return data;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData = {}) => {
    try {
      setLoading(true);
      console.log("Attempting to sign up:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Erreur d'inscription:", error);
        throw error;
      }
      
      if (data.user) {
        toast.success('Inscription réussie ! Veuillez vérifier votre email.');
        
        // Create or update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            ...userData
          });
          
        if (profileError) {
          console.error('Erreur de création de profil:', profileError);
        }
      }
      
      return data;
    } catch (err) {
      console.error("Erreur d'inscription:", err);
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
        redirectTo: `${window.location.origin}/update-password`,
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
