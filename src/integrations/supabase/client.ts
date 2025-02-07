
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rbfzhxnhamdziisulfjd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZnpoeG5oYW1kemlpc3VsZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1OTk3MjIsImV4cCI6MjA1MjE3NTcyMn0.-RjhcnusghQF7x628fyrC_NLNKA1IqTe11QNkp47rOs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
};
