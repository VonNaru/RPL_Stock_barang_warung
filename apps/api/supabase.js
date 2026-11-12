import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ----------   Environment loading (no __dirname)   ----------
// Netlify Functions run from the project root, so `process.cwd()` points
// to the root folder of the repository. We first try the .env inside the
// API folder, then the root .env (if it exists). This works both locally
// and in the Netlify sandbox.
const rootDir = process.cwd();

dotenv.config({ path: path.resolve(rootDir, 'apps/api/.env') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

const hasSupabaseConfig = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
const missingConfigError = () => {
  const error = new Error('Konfigurasi Supabase belum lengkap. Isi apps/api/.env terlebih dahulu.');
  error.status = 503;
  throw error;
};

if (!hasSupabaseConfig) {
  console.warn('Supabase belum dikonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi di apps/api/.env.');
}

export const supabase = hasSupabaseConfig
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  : { from: missingConfigError, rpc: missingConfigError };
