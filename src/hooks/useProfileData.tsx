
import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from './useAuthTypes';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('VITE_API_URL doit être défini dans .env');

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
        // In our new system, role information is already part of the user object from login
        // but we could still fetch additional profile data from a profile endpoint if needed
        setIsSuperAdmin(user?.role === 'superadmin');
        setIsMasterAdmin(user?.role === 'admin'); // Simplified for this example
        
        setProfileData({
          department: 'default',
          is_super_admin: user?.role === 'superadmin',
          is_master_admin: user?.role === 'admin',
          first_name: user?.displayName?.split(' ')[0] || user.email?.split('@')[0] || '', // Fallback when firstName is not available
          last_name: user?.displayName?.split(' ')[1] || ''
        });
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
