
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('VITE_API_URL doit être défini dans .env');

export function useAdminMethods() {
  const [loading, setLoading] = useState(false);

  const createSuperAdmin = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/auth/create-super-admin`, {
        email,
        password,
        firstName,
        lastName
      });

      if (response.status !== 201) {
        throw new Error(response.data.message || 'Super admin creation failed');
      }
      
      toast.success('Compte super admin créé avec succès !');
      
      return response.data;
    } catch (err: any) {
      console.error("Erreur lors de la création du super admin:", err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const createMasterAdmin = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      // For this implementation, we'll use the same endpoint but with a different role
      // In a real app, you might want a separate endpoint
      const response = await axios.post(`${API_URL}/auth/create-super-admin`, {
        email,
        password,
        firstName,
        lastName,
        isMasterAdmin: true
      });

      if (response.status !== 201) {
        throw new Error(response.data.message || 'Master admin creation failed');
      }
      
      toast.success('Compte master admin créé avec succès !');
      
      return response.data;
    } catch (err: any) {
      console.error("Erreur lors de la création du master admin:", err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSuperAdmin,
    createMasterAdmin
  };
}
