import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://pxqcwjoeugkociplwyzr.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cWN3am9ldWdrb2NpcGx3eXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDQwMzMsImV4cCI6MjEwMTE4MDAzM30.1XzSqbemZe4ftecXNuIcXgoFAWlu8j5it0QKjQ5P1uY';

export const getSupabaseUrl = (): string => {
  return (
    localStorage.getItem('hl_supabase_url') ||
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).trim();
};

export const getSupabaseAnonKey = (): string => {
  return (
    localStorage.getItem('hl_supabase_anon_key') ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY
  ).trim();
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return (
    !url.includes('placeholder-url') &&
    !key.includes('placeholder-anon-key') &&
    url.startsWith('http')
  );
};

export const extractProjectRef = (url: string): string => {
  try {
    const parsed = new URL(url);
    const parts = parsed.hostname.split('.');
    if (parts.length >= 3 && parts[1] === 'supabase') {
      return parts[0];
    }
  } catch {}
  return 'pxqcwjoeugkociplwyzr';
};

export interface SupabaseHealthResult {
  ok: boolean;
  status: 'connected' | 'paused' | 'invalid_key' | 'offline' | 'unconfigured';
  message: string;
  projectRef: string;
}

/**
 * Proactively check if the Supabase project is active, paused, or unreachable
 */
export async function checkSupabaseHealth(
  targetUrl?: string,
  targetKey?: string
): Promise<SupabaseHealthResult> {
  const url = (targetUrl || getSupabaseUrl()).replace(/\/+$/, '');
  const key = targetKey || getSupabaseAnonKey();
  const projectRef = extractProjectRef(url);

  if (!url || !key || url.includes('placeholder')) {
    return {
      ok: false,
      status: 'unconfigured',
      message: 'Supabase ainda não configurado.',
      projectRef
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    // 1. First probe standard Supabase Auth Health endpoint
    const authRes = await fetch(`${url}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: key
      },
      signal: controller.signal
    }).catch(() => null);

    // 2. Probe REST database table endpoint
    const restRes = await fetch(`${url}/rest/v1/user_sync_data?select=sync_code&limit=1`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if ((authRes && (authRes.ok || authRes.status === 200)) || (restRes && (restRes.ok || restRes.status === 200 || restRes.status === 206))) {
      return {
        ok: true,
        status: 'connected',
        message: 'Conectado ao Supabase com sucesso!',
        projectRef
      };
    } else if (restRes && (restRes.status === 401 || restRes.status === 403)) {
      return {
        ok: false,
        status: 'invalid_key',
        message: 'URL encontrada, porém a Chave Anon é inválida ou expirou.',
        projectRef
      };
    } else if (authRes || restRes) {
      const status = (authRes || restRes)?.status;
      return {
        ok: true,
        status: 'connected',
        message: 'Conectado ao Supabase!',
        projectRef
      };
    } else {
      return {
        ok: false,
        status: 'offline',
        message: `Servidor não respondeu.`,
        projectRef
      };
    }
  } catch (err: any) {
    // Network error: could be paused project (DNS NXDOMAIN) or internet offline
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (isOffline) {
      return {
        ok: false,
        status: 'offline',
        message: 'Seu computador parece estar sem conexão com a internet.',
        projectRef
      };
    }

    return {
      ok: false,
      status: 'paused',
      message: `Projeto Supabase (${projectRef}) inacessível ou pausado por inatividade.`,
      projectRef
    };
  }
}

export let supabase: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());

export const reinitSupabase = (url: string, key: string) => {
  localStorage.setItem('hl_supabase_url', url.trim());
  localStorage.setItem('hl_supabase_anon_key', key.trim());
  supabase = createClient(url.trim(), key.trim());
};
