import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://nhectfwlukgjzbkuslqn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZWN0ZndsdWtnanpia3VzbHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNjQ5MjIsImV4cCI6MjA1MDk0MDkyMn0.D2hXqUg9EqUfTcHjKNvpPq7qcJNMcmNHlui2QMe-1ss";

// Création du client Supabase avec vérification
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Fonction utilitaire pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return !!supabase;
};

console.log("Supabase configuration status:", isSupabaseConfigured() ? "configured" : "not configured");