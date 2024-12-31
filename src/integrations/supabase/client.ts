import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nhectfwlukgjzbkuslqn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZWN0ZndsdWtnanpia3VzbHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNjQ5MjIsImV4cCI6MjA1MDk0MDkyMn0.D2hXqUg9EqUfTcHjKNvpPq7qcJNMcmNHlui2QMe-1ss";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);