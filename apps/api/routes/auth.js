import { Router } from 'express';
import { supabase } from '../supabase.js';
import {
  validateLoginInput,
  validateRegisterInput,
  hashPassword,
  verifyPassword,
  sanitizeUser
} from '../services/authService.js';

const router = Router();

/**
 * POST /api/auth/login
 * Masuk ke sistem menggunakan username dan password
 */
router.post('/login', async (req, res, next) => {
  try {
    const username = req.body.username ?? req.body.userName;
    const password = req.body.password;

    const validation = validateLoginInput({ username, password });
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Username dan password wajib diisi.',
        errors: validation.errors
      });
    }

    const { data: user, error } = await supabase
      .from('tabel_pengguna')
      .select('*')
      .ilike('username', validation.sanitized.username)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const isMatch = verifyPassword(validation.sanitized.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    // Jika password di database masih plain text (dari seed SQL / manual), otomatis upgrade ke scrypt hash
    if (!user.password.startsWith('scrypt:')) {
      const newHash = hashPassword(validation.sanitized.password);
      supabase
        .from('tabel_pengguna')
        .update({ password: newHash })
        .eq('id_pengguna', user.id_pengguna)
        .then(() => {})
        .catch((err) => console.error('Gagal meng-upgrade hash password:', err.message));
    }

    const safeUser = sanitizeUser(user);
    const token = Buffer.from(`${user.id_pengguna}:${Date.now()}`).toString('base64');

    res.json({
      message: 'Login berhasil.',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Mendaftarkan akun pengguna baru
 */
router.post('/register', async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const namaLengkap = req.body.nama_lengkap ?? req.body.namaLengkap;
    const role = req.body.role ?? 'kasir';

    const validation = validateRegisterInput({
      username,
      password,
      nama_lengkap: namaLengkap,
      role
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Data registrasi tidak valid.',
        errors: validation.errors
      });
    }

    // Cek duplikasi username
    const { data: existing, error: checkError } = await supabase
      .from('tabel_pengguna')
      .select('id_pengguna')
      .ilike('username', validation.sanitized.username)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      return res.status(409).json({ message: 'Username sudah digunakan oleh akun lain.' });
    }

    const hashedPassword = hashPassword(validation.sanitized.password);

    const { data, error } = await supabase
      .from('tabel_pengguna')
      .insert({
        username: validation.sanitized.username,
        password: hashedPassword,
        nama_lengkap: validation.sanitized.nama_lengkap,
        role: validation.sanitized.role
      })
      .select('id_pengguna, username, nama_lengkap, role, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Pengguna baru berhasil didaftarkan.',
      user: data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/users
 * Mendapatkan daftar seluruh akun pengguna
 */
router.get('/users', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('tabel_pengguna')
      .select('id_pengguna, username, nama_lengkap, role, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Keluar dari sistem
 */
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logout berhasil.' });
});

export default router;

