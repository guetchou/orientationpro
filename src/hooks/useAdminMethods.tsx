
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAdminMethods() {
  const [loading, setLoading] = useState(false);

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
    loading,
    createSuperAdmin,
    createMasterAdmin
  };
}
