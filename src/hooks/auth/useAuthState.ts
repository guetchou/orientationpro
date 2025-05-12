
import { useState } from 'react';
import { User, ProfileData } from '../useAuthTypes';

/**
 * Hook pour gérer l'état d'authentification
 */
export const useAuthState = () => {
  // États d'authentification
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  return {
    user,
    setUser,
    profile,
    setProfile,
    loading,
    setLoading,
    isSuperAdmin,
    setIsSuperAdmin,
    isMasterAdmin,
    setIsMasterAdmin,
    profileData,
    setProfileData
  };
};
