import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://pxqcwjoeugkociplwyzr.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cWN3am9ldWdrb2NpcGx3eXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDQwMzMsImV4cCI6MjEwMTE4MDAzM30.1XzSqbemZe4ftecXNuIcXgoFAWlu8j5it0QKjQ5P1uY';

const getSupabaseUrl = () => {
  return localStorage.getItem('hl_supabase_url') || (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
};

const getSupabaseAnonKey = () => {
  return localStorage.getItem('hl_supabase_anon_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
};

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return !url.includes('placeholder-url') && !key.includes('placeholder-anon-key') && url.startsWith('http');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
