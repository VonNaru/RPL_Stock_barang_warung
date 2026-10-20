import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from apps/api/.env, root .env, or local directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const hasSupabaseConfig = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
const missingConfigError = () => {
  const error = new Error('Konfigurasi Supabase belum lengkap. Isi apps/api/.env terlebih dahulu.');
  error.status = 503;
  throw error;
};

if (!hasSupabaseConfig) {
  console.warn('Supabase belum dikonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi di apps/api/.env.');
}

export const supabase = hasSupabaseConfig ? createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
) : { from: missingConfigError, rpc: missingConfigError };