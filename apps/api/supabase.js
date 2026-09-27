import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const hasSupabaseConfig = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
const missingConfigError = () => {
  const error = new Error('Konfigurasi Supabase belum lengkap. Isi apps/api/.env terlebih dahulu.');
  error.status = 503;
  throw error;
};

if (!hasSupabaseConfig) console.warn('Supabase belum dikonfigurasi. Buat apps/api/.env sebelum memakai API.');

export const supabase = hasSupabaseConfig ? createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
) : { from: missingConfigError, rpc: missingConfigError };