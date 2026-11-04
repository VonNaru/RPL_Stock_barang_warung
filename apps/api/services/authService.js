import crypto from 'node:crypto';

/**
 * Service untuk aturan bisnis Autentikasi Pengguna & Login
 */

export const ALLOWED_ROLES = ['admin', 'kasir', 'pemilik'];

/**
 * Validasi input login
 */
export const validateLoginInput = ({ username, password }) => {
  const errors = [];

  if (typeof username !== 'string' || !username.trim()) {
    errors.push('Username wajib diisi.');
  }

  if (typeof password !== 'string' || !password) {
    errors.push('Password wajib diisi.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      username: username.trim().toLowerCase(),
      password
    }
  };
};

/**
 * Validasi input registrasi pengguna baru
 */
export const validateRegisterInput = ({ username, password, nama_lengkap, role = 'kasir' }) => {
  const errors = [];

  if (typeof username !== 'string' || !username.trim()) {
    errors.push('Username wajib diisi.');
  } else {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 3) {
      errors.push('Username minimal 3 karakter.');
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      errors.push('Username hanya boleh berisi huruf, angka, dan underscore (_).');
    }
  }

  if (typeof password !== 'string' || password.length < 6) {
    errors.push('Password minimal 6 karakter.');
  }

  if (typeof nama_lengkap !== 'string' || !nama_lengkap.trim()) {
    errors.push('Nama lengkap wajib diisi.');
  }

  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : 'kasir';
  if (!ALLOWED_ROLES.includes(normalizedRole)) {
    errors.push(`Role harus salah satu dari: ${ALLOWED_ROLES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      username: username.trim().toLowerCase(),
      password,
      nama_lengkap: nama_lengkap.trim(),
      role: normalizedRole
    }
  };
};

/**
 * Menghasilkan hash password berbasis scrypt
 */
export const hashPassword = (password) => {
  if (typeof password !== 'string' || !password) {
    throw new Error('Password tidak boleh kosong.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
};

/**
 * Memverifikasi kecocokan password dengan hash atau plaintext fallback
 */
export const verifyPassword = (password, storedPassword) => {
  if (typeof password !== 'string' || typeof storedPassword !== 'string') {
    return false;
  }

  if (storedPassword.startsWith('scrypt:')) {
    const parts = storedPassword.split(':');
    if (parts.length !== 3) return false;
    const [, salt, hash] = parts;
    const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const buf1 = Buffer.from(hash, 'hex');
    const buf2 = Buffer.from(verifyHash, 'hex');
    if (buf1.length !== buf2.length) return false;
    return crypto.timingSafeEqual(buf1, buf2);
  }

  // Fallback untuk akun demo atau insert langsung di Supabase SQL Editor
  return password === storedPassword;
};

/**
 * Menghapus data sensitif (password) dari objek pengguna
 */
export const sanitizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

