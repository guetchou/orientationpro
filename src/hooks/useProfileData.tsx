
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface ProfileData {
  department?: string;
  is_super_admin: boolean;
  is_master_admin: boolean;
  first_name?: string;
  last_name?: string;
}

export function useProfileData(user: User | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setIsMasterAdmin(false);
        setProfileData(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('department, is_super_admin, is_master_admin, first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsSuperAdmin(false);
          setIsMasterAdmin(false);
          setProfileData(null);
        } else if (data) {
          setIsSuperAdmin(data.is_super_admin || false);
          setIsMasterAdmin(data.is_master_admin || false);
          setProfileData(data);
        } else {
          setIsSuperAdmin(false);
          setIsMasterAdmin(false);
          setProfileData(null);
        }
      } catch (err) {
        console.error('Error in profile data fetching:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  return { 
    profileData, 
    isSuperAdmin, 
    isMasterAdmin, 
    loading, 
    error 
  };
}
