import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase. Seules l'URL du projet et la clé publique (anon/publishable)
 * sont utilisées côté navigateur ; la sécurité repose sur les politiques RLS.
 * La clé service_role ne doit JAMAIS être exposée ici (Edge Functions uniquement).
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

let client: Promise<SupabaseClient> | null = null;

/** Chargé à la demande pour ne pas alourdir la page tant que Supabase n'est pas utilisé. */
export function getSupabase(): Promise<SupabaseClient> {
  if (!url || !anonKey) {
    return Promise.reject(
      new Error('Supabase non configuré : définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'),
    );
  }
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url, anonKey, { auth: { persistSession: true } }),
  );
  return client;
}
