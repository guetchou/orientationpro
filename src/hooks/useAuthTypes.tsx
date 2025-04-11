
export interface User {
  id: string;
  email: string;
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
}
