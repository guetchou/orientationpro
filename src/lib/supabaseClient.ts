
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://azikiiztfejmywbhtuak.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aWtpaXp0ZmVqbXl3Ymh0dWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTU0NDEsImV4cCI6MjA1NTYzMTQ0MX0.Zlv42ARiWIFlxT9pmqftpp50AkwSOdpr1ckG5vwaFLk';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
