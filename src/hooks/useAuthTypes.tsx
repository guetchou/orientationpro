
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  photoURL?: string;
  displayName?: string;
}

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  phone: string;
  address: string;
  role: string;
}

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  session: Session | null;
  profileData: ProfileData;
  isSuperAdmin: boolean;
  isMasterAdmin: boolean;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  logout: () => Promise<{ success: boolean; error?: any }>;
  signInWithGoogle: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signInWithGithub: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  createSuperAdmin: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
}
