
import { useState } from 'react';
import { toast } from 'sonner';
import { User } from './useAuth';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useAuthMethods() {
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting to sign in with:", email);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      toast.success('Connexion réussie !');
      
      return { user, token };
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage === "Invalid login credentials" 
        ? "Email ou mot de passe incorrect" 
        : errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Record<string, any> = {}) => {
    try {
      setLoading(true);
      console.log("Attempting to sign up:", email);
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName: userData.firstName || 'New',
        lastName: userData.lastName || 'User',
        ...userData
      });

      if (response.status !== 201) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      toast.success('Inscription réussie !');
      
      return { user, token };
    } catch (err: any) {
      console.error("Erreur d'inscription:", err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      toast.success('Déconnexion réussie');
      
      // Force page reload to clear any in-memory state
      window.location.href = '/';
      
    } catch (err: any) {
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
      
      const response = await axios.post(`${API_URL}/auth/reset-password`, { email });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Password reset failed');
      }
      
      toast.success('Email de réinitialisation envoyé !');
      
    } catch (err: any) {
      console.error('Erreur de réinitialisation du mot de passe:', err);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string, resetToken: string) => {
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/auth/update-password`, {
        newPassword,
        resetToken
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Password update failed');
      }
      
      toast.success('Mot de passe mis à jour avec succès');
      
    } catch (err: any) {
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
