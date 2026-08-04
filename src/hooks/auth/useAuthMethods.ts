import { toast } from 'sonner';
import {
  apiFetch,
  clearAuthSession,
  getStoredUserData,
  persistAuthSession,
  type AuthAccount,
  type AuthSessionPayload,
} from '@/lib/apiClient';
import type { ProfileData, User } from '../useAuthTypes';

const userFromAccount = (account: AuthAccount): User => ({
  id: account.id,
  email: account.email,
  role: account.roles?.includes('super_admin')
    ? 'super_admin'
    : account.roles?.includes('admin')
      ? 'admin'
      : account.roles?.[0] || 'user',
  displayName: account.email.split('@')[0],
});

const profileFromAccount = (account: AuthAccount): ProfileData => ({
  id: account.id,
  email: account.email,
  status: account.status,
  first_name: account.email.split('@')[0],
  is_super_admin: account.roles?.includes('super_admin') || false,
  is_master_admin: account.roles?.includes('master_admin') || false,
});

export const useAuthMethods = (
  setUser: (user: User | null) => void,
  setProfile: (profile: ProfileData | null) => void,
  setProfileData: (profile: ProfileData | null) => void,
  setIsSuperAdmin: (value: boolean) => void,
  setIsMasterAdmin: (value: boolean) => void,
) => {
  const applyAccount = (account: AuthAccount) => {
    const user = userFromAccount(account);
    const profile = profileFromAccount(account);
    setUser(user);
    setProfile(profile);
    setProfileData(profile);
    setIsSuperAdmin(Boolean(profile.is_super_admin));
    setIsMasterAdmin(Boolean(profile.is_master_admin));
    return user;
  };

  const fetchProfile = async (_userId?: string) => {
    const stored = getStoredUserData();
    if (!stored) return null;
    const account: AuthAccount = {
      id: stored.id,
      email: stored.email,
      status: stored.status || 'active',
      roles: Array.isArray(stored.roles) ? stored.roles : [stored.role || 'user'],
    };
    return applyAccount(account);
  };

  const signIn = async (email: string, password?: string) => {
    const payload = await apiFetch<AuthSessionPayload>(
      '/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password: password || '' }),
      },
      { auth: false },
    );
    persistAuthSession(payload);
    const user = applyAccount(payload.account);
    toast.success('Connexion réussie.');
    return { user, account: payload.account };
  };

  const signUp = async (email: string, password?: string) => {
    const payload = await apiFetch<{ account: AuthAccount }>(
      '/v1/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password: password || '' }),
      },
      { auth: false },
    );
    toast.success('Compte créé. Consultez votre messagerie pour le vérifier.');
    return payload;
  };

  const signOut = async () => {
    try {
      await apiFetch<null>(
        '/v1/auth/logout',
        { method: 'POST' },
        { auth: false },
      );
    } catch (error) {
      console.warn('La session distante n’a pas pu être révoquée.', error);
    } finally {
      clearAuthSession();
      setUser(null);
      setProfile(null);
      setProfileData(null);
      setIsSuperAdmin(false);
      setIsMasterAdmin(false);
      toast.success('Déconnexion réussie.');
    }
  };

  const updateProfile = async (profileData: Partial<ProfileData>) => {
    const stored = getStoredUserData();
    if (!stored) throw new Error('Utilisateur non connecté.');
    const next = { ...stored, ...profileData };
    localStorage.setItem('userData', JSON.stringify(next));
    const profile: ProfileData = {
      id: next.id,
      email: next.email,
      first_name: next.first_name || next.full_name?.split(' ')[0],
      last_name: next.last_name,
      status: next.status || 'active',
      is_super_admin: Boolean(next.is_super_admin),
      is_master_admin: Boolean(next.is_master_admin),
    };
    setProfile(profile);
    setProfileData(profile);
    toast.success('Profil mis à jour localement.');
  };

  return {
    fetchProfile,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updateProfile,
  };
};
