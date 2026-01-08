
// [LOCAL MODE] Supabase désactivé - Mode local uniquement
// import { createClient } from '@supabase/supabase-js';

// Get environment variables - MODE LOCAL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock Supabase client for local mode
const mockSupabaseClient = {
  auth: {
    signInWithOtp: () => Promise.resolve({ data: null, error: null }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  }),
  functions: {
    invoke: () => Promise.resolve({ data: null, error: null })
  }
};

// Export mock client instead of real Supabase client
export const supabase = mockSupabaseClient;

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

// [LOCAL MODE] Realtime subscriptions désactivées
// const channel = supabase.channel('public:appointments');
// channel
//   .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {})
//   .subscribe();

export default supabase;
