import { useCallback, useEffect, useState } from 'react';
import {
  apiFetch,
  AUTH_CHANGED_EVENT,
  clearAuthSession,
  getStoredAccessToken,
  getStoredUserData,
  refreshAuthSession,
  storedUserFromAccount,
  type AuthAccount,
} from '@/lib/apiClient';
import type { ProfileData, User } from '../useAuthTypes';

const mapStoredUser = (stored: any): User => ({
  id: stored.id,
  email: stored.email,
  role: stored.role || stored.roles?.[0] || 'user',
  displayName: stored.full_name || stored.email?.split('@')[0],
});

const mapStoredProfile = (stored: any): ProfileData => ({
  id: stored.id,
  email: stored.email,
  first_name: stored.first_name || stored.full_name?.split(' ')[0],
  last_name: stored.last_name,
  status: stored.status || 'active',
  is_super_admin: Boolean(stored.is_super_admin || stored.roles?.includes('super_admin')),
  is_master_admin: Boolean(stored.is_master_admin || stored.roles?.includes('master_admin')),
});

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const clearState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setProfileData(null);
    setIsSuperAdmin(false);
    setIsMasterAdmin(false);
  }, []);

  const applyStored = useCallback((stored: any) => {
    if (!stored?.id || !stored?.email) {
      clearState();
      return false;
    }
    const nextUser = mapStoredUser(stored);
    const nextProfile = mapStoredProfile(stored);
    setUser(nextUser);
    setProfile(nextProfile);
    setProfileData(nextProfile);
    setIsSuperAdmin(Boolean(nextProfile.is_super_admin));
    setIsMasterAdmin(Boolean(nextProfile.is_master_admin));
    return true;
  }, [clearState]);

  const syncAuthState = useCallback(() => {
    const stored = getStoredUserData();
    if (!stored) {
      clearState();
      return false;
    }
    return applyStored(stored);
  }, [applyStored, clearState]);

  const applyAccount = useCallback((account: AuthAccount) => {
    const stored = storedUserFromAccount(account);
    localStorage.setItem('userData', JSON.stringify(stored));
    localStorage.setItem('userRole', stored.role);
    applyStored(stored);
  }, [applyStored]);

  const refreshAuthState = useCallback(async () => {
    setLoading(true);
    try {
      const token = getStoredAccessToken();
      if (token) {
        const payload = await apiFetch<{ account: AuthAccount }>('/v1/auth/session');
        applyAccount(payload.account);
        return;
      }

      const refreshed = await refreshAuthSession();
      if (refreshed) {
        applyAccount(refreshed.account);
      } else {
        clearState();
      }
    } catch (error) {
      console.warn('Session Auth V1 indisponible.', error);
      clearAuthSession();
      clearState();
    } finally {
      setLoading(false);
    }
  }, [applyAccount, clearState]);

  useEffect(() => {
    void refreshAuthState();
  }, [refreshAuthState]);

  useEffect(() => {
    const handleAuthChanged = () => {
      syncAuthState();
    };
    const handleStorage = (event: StorageEvent) => {
      if (['userToken', 'userData', 'userRole'].includes(event.key || '')) {
        syncAuthState();
      }
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncAuthState]);

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
    syncAuthState,
  };
};
