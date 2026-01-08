
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
  is_super_admin?: boolean;
  is_master_admin?: boolean;
  interests?: string;
  experience?: string;
  education?: string;
  status?: string;
}

export interface User {
  id: string;
  email: string;
  role?: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthContextProps {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<any>;
  signUp: (email: string, password?: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  profileData?: ProfileData;
  isSuperAdmin: boolean;
  isMasterAdmin: boolean;
}
