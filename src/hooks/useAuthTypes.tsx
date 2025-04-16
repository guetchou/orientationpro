
export interface User {
  id: string;
  email: string;
  role?: string;
  displayName?: string;
  photoURL?: string;
}

export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  bio?: string;
  created_at?: string;
  role?: string;
  is_super_admin?: boolean;
  is_master_admin?: boolean;
}

export interface AuthContextProps {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: any; token: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: any; token: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => void;
  logout: () => Promise<void>;
  profileData?: ProfileData;
  isSuperAdmin?: boolean;
  isMasterAdmin?: boolean;
}
