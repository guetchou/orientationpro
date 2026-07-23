import React, { ReactNode } from 'react';
import { AuthContext } from './useAuthContext';
import { AuthContextProps } from './useAuthTypes';
import { useAuthState } from './auth/useAuthState';
import { useAuthMethods } from './auth/useAuthMethods';

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    setUser,
    profile,
    setProfile,
    loading,
    isSuperAdmin,
    setIsSuperAdmin,
    isMasterAdmin,
    setIsMasterAdmin,
    profileData,
    setProfileData,
    refreshAuthState,
  } = useAuthState();

  const {
    fetchProfile,
    signIn,
    signUp,
    signOut,
    logout,
    updateProfile,
  } = useAuthMethods(
    setUser,
    setProfile,
    setProfileData,
    setIsSuperAdmin,
    setIsMasterAdmin,
  );

  const value: AuthContextProps = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile: async () => {
      if (user) {
        await fetchProfile(user.id);
      } else {
        await refreshAuthState();
      }
    },
    logout,
    profileData: profileData || undefined,
    isSuperAdmin,
    isMasterAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
