import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// supabase.js – initialize Supabase client using Netlify runtime env vars
// Do NOT rely on local .env files in production – Netlify injects the variables
// directly into process.env. We keep the dotenv loading for local dev only
// (it will silently ignore missing files).
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env files only when they exist (local development)
const rootDir = process.cwd();
dotenv.config({ path: path.resolve(rootDir, 'apps/api/.env') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

// Required variables – Netlify will provide them at runtime
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('⚠️ Supabase configuration missing – SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set.');
}

export const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  : {
      // Minimal stub that throws a clear error when used in production without config
      from: () => { throw new Error('Supabase client not initialized – missing URL or Service Role Key.'); },
      rpc: () => { throw new Error('Supabase client not initialized – missing URL or Service Role Key.'); }
    };

