
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://default.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'defaultkey';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Mise à jour du type CmsContent pour y ajouter des champs
export type CmsContent = {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  category?: string;
};

export default supabase;
