import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLoginInput,
  validateRegisterInput,
  hashPassword,
  verifyPassword,
  sanitizeUser,
  ALLOWED_ROLES
} from '../apps/api/services/authService.js';

describe('User Story 7: Autentikasi Pengguna & Login Sistem Warung', () => {
  it('AC 7.1: Berhasil memvalidasi input login yang valid dan normalisasi username', () => {
    const input = {
      username: '  Admin  ',
      password: 'mypassword123'
    };

    const result = validateLoginInput(input);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.sanitized, {
      username: 'admin',
      password: 'mypassword123'
    });
  });

  it('AC 7.2: Menolak login jika username kosong atau hanya whitespace', () => {
    const result = validateLoginInput({ username: '   ', password: 'password123' });
    assert.equal(result.isValid, false);
    assert.match(result.errors[0], /Username wajib diisi/);

    const resultNull = validateLoginInput({ username: null, password: 'password123' });
    assert.equal(resultNull.isValid, false);
  });

  it('AC 7.3: Menolak login jika password kosong', () => {
    const result = validateLoginInput({ username: 'admin', password: '' });
    assert.equal(result.isValid, false);
    assert.match(result.errors[0], /Password wajib diisi/);
  });

  it('AC 7.4: Berhasil memvalidasi pendaftaran akun baru yang valid', () => {
    const input = {
      username: 'kasir_warung',
      password: 'password123',
      nama_lengkap: 'Siti Aminah',
      role: 'kasir'
    };

    const result = validateRegisterInput(input);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.sanitized, {
      username: 'kasir_warung',
      password: 'password123',
      nama_lengkap: 'Siti Aminah',
      role: 'kasir'
    });
  });

  it('AC 7.5: Mengisi role default "kasir" jika role tidak disertakan', () => {
    const input = {
      username: 'budi_santoso',
      password: 'password123',
      nama_lengkap: 'Budi Santoso'
    };

    const result = validateRegisterInput(input);
    assert.equal(result.isValid, true);
    assert.equal(result.sanitized.role, 'kasir');
  });

  it('AC 7.6: Menolak registrasi jika username kurang dari 3 karakter atau mengandung karakter tidak valid', () => {
    const resultShort = validateRegisterInput({
      username: 'ab',
      password: 'password123',
      nama_lengkap: 'Budi'
    });
    assert.equal(resultShort.isValid, false);
    assert.match(resultShort.errors[0], /Username minimal 3 karakter/);

    const resultSpecial = validateRegisterInput({
      username: 'budi santoso@!',
      password: 'password123',
      nama_lengkap: 'Budi'
    });
    assert.equal(resultSpecial.isValid, false);
    assert.match(resultSpecial.errors[0], /huruf, angka, dan underscore/);
  });

  it('AC 7.7: Menolak registrasi jika password kurang dari 6 karakter', () => {
    const result = validateRegisterInput({
      username: 'joko123',
      password: '12345',
      nama_lengkap: 'Joko'
    });
    assert.equal(result.isValid, false);
    assert.match(result.errors[0], /Password minimal 6 karakter/);
  });

  it('AC 7.8: Menolak registrasi jika role di luar daftar yang diizinkan', () => {
    const result = validateRegisterInput({
      username: 'joko123',
      password: 'password123',
      nama_lengkap: 'Joko',
      role: 'superadmin_hacker'
    });
    assert.equal(result.isValid, false);
    assert.match(result.errors[0], /Role harus salah satu dari/);
  });

  it('AC 7.9: Hashing password scrypt menghasilkan format hash yang valid dan dapat diverifikasi', () => {
    const password = 'RahasiaWarung2026';
    const hash = hashPassword(password);

    assert.equal(typeof hash, 'string');
    assert.equal(hash.startsWith('scrypt:'), true);

    // Verifikasi password benar
    const isCorrect = verifyPassword(password, hash);
    assert.equal(isCorrect, true);

    // Verifikasi password salah
    const isWrong = verifyPassword('PasswordSalah', hash);
    assert.equal(isWrong, false);
  });

  it('AC 7.10: Mendukung verifikasi plaintext fallback untuk seed akun demo awal', () => {
    const plainDemo = 'admin123';
    assert.equal(verifyPassword('admin123', plainDemo), true);
    assert.equal(verifyPassword('salah', plainDemo), false);
  });

  it('AC 7.11: sanitizeUser menghapus properti password dari objek pengguna', () => {
    const rawUser = {
      id_pengguna: 'user-uuid-123',
      username: 'admin',
      password: 'hashed-or-plain-password',
      nama_lengkap: 'Admin Warung',
      role: 'admin',
      created_at: '2026-11-04T00:00:00Z'
    };

    const safe = sanitizeUser(rawUser);
    assert.equal(safe.password, undefined);
    assert.equal(safe.username, 'admin');
    assert.equal(safe.nama_lengkap, 'Admin Warung');
    assert.equal(safe.id_pengguna, 'user-uuid-123');
  });
});

