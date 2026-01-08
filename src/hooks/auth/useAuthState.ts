
import { useState, useEffect } from 'react';
import { User, ProfileData } from '../useAuthTypes';

/**
 * Hook pour gérer l'état d'authentification unifié
 */
export const useAuthState = () => {
  // États d'authentification
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Fonction pour synchroniser l'état avec localStorage
  const syncAuthState = () => {
    try {
      const userToken = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      const adminToken = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');

      if (userToken && userData) {
        // Compte de test ou Supabase
        const userInfo = JSON.parse(userData);
        const newUser: User = {
          id: userInfo.id || 'test-user',
          email: userInfo.email,
          role: userInfo.role,
          displayName: userInfo.full_name || userInfo.email
        };

        const newProfile: ProfileData = {
          id: userInfo.id,
          email: userInfo.email,
          first_name: userInfo.full_name?.split(' ')[0],
          last_name: userInfo.full_name?.split(' ').slice(1).join(' '),
          is_super_admin: userInfo.is_super_admin || false,
          is_master_admin: userInfo.is_master_admin || false,
          status: 'active'
        };

        setUser(newUser);
        setProfile(newProfile);
        setProfileData(newProfile);
        setIsSuperAdmin(userInfo.is_super_admin || false);
        setIsMasterAdmin(userInfo.is_master_admin || false);
        setLoading(false);
        return;
      }

      if (adminToken && adminUser) {
        // Ancien système backend
        const adminInfo = JSON.parse(adminUser);
        const newUser: User = {
          id: adminInfo.id || 'admin-user',
          email: adminInfo.email,
          role: 'admin',
          displayName: adminInfo.name || adminInfo.email
        };

        const newProfile: ProfileData = {
          id: adminInfo.id,
          email: adminInfo.email,
          first_name: adminInfo.name?.split(' ')[0],
          last_name: adminInfo.name?.split(' ').slice(1).join(' '),
          is_super_admin: true,
          is_master_admin: false,
          status: 'active'
        };

        setUser(newUser);
        setProfile(newProfile);
        setProfileData(newProfile);
        setIsSuperAdmin(true);
        setIsMasterAdmin(false);
        setLoading(false);
        return;
      }

      // Aucun utilisateur connecté
      setUser(null);
      setProfile(null);
      setProfileData(null);
      setIsSuperAdmin(false);
      setIsMasterAdmin(false);
      setLoading(false);

    } catch (error) {
      console.error('Erreur lors de la synchronisation de l\'état d\'authentification:', error);
      // Nettoyer les données corrompues
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      setUser(null);
      setProfile(null);
      setProfileData(null);
      setIsSuperAdmin(false);
      setIsMasterAdmin(false);
      setLoading(false);
    }
  };

  // Synchroniser l'état au montage du composant
  useEffect(() => {
    syncAuthState();
  }, []);

  // Écouter les changements de localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userToken' || e.key === 'userData' || e.key === 'adminToken' || e.key === 'adminUser') {
        syncAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fonction pour forcer la synchronisation
  const refreshAuthState = () => {
    syncAuthState();
  };

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
    setProfileData,
    refreshAuthState,
    syncAuthState
  };
};
