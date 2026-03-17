import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

const publicSupabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const fetchGymByCode = unstable_cache(
  async (code: string) => {
    const { data, error } = await publicSupabase.rpc('get_gym_by_code', { p_code: code });
    if (error) {
      throw new Error(`Failed to fetch gym by code: ${error.message}`);
    }
    return data;
  },
  ['gym-public-by-code'],
  { revalidate: 86400 },
);

export async function getGymPublicByCode(rawCode: string) {
  const code = normalizeGymCode(rawCode);
  const data = await fetchGymByCode(code);
  return { code, data };
}

export function getGymAssetPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const cleaned = path.trim().replace(/^\/+/, '');
  if (!cleaned) return null;

  const encodedPath = cleaned.split('/').map(encodeURIComponent).join('/');
  return `${supabaseUrl}/storage/v1/object/public/gym-assets/${encodedPath}`;
}

function normalizeGymCode(rawCode: string): string {
  try {
    return decodeURIComponent(rawCode).trim();
  } catch {
    return rawCode.trim();
  }
}
