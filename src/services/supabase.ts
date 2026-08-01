import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => {
  return localStorage.getItem('hl_supabase_url') || (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
};

const getSupabaseAnonKey = () => {
  return localStorage.getItem('hl_supabase_anon_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';
};

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return !url.includes('placeholder-url') && !key.includes('placeholder-anon-key') && url.startsWith('http');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
