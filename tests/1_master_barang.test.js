import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateBarangInput } from '../apps/api/services/barangService.js';

describe('User Story 1: Manajemen Master Barang (Katalog Stok Warung)', () => {
  it('AC 1.1: Berhasil memvalidasi input barang yang valid dengan normalisasi nama', () => {
    const input = {
      nama_barang: '  Beras Ramos 5kg  ',
      stok_saat_ini: 15,
      stok_minimum: 5
    };

    const result = validateBarangInput(input);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.sanitized, {
      nama_barang: 'Beras Ramos 5kg',
      stok_saat_ini: 15,
      stok_minimum: 5
    });
  });

  it('AC 1.1: Mengisi nilai default stok 0 jika tidak disertakan', () => {
    const input = { nama_barang: 'Kopi Kapal Api 65g' };
    const result = validateBarangInput(input);

    assert.equal(result.isValid, true);
    assert.equal(result.sanitized.stok_saat_ini, 0);
    assert.equal(result.sanitized.stok_minimum, 0);
  });

  it('AC 1.2: Menolak jika nama barang kosong atau hanya whitespace', () => {
    const inputEmpty = { nama_barang: '   ', stok_saat_ini: 5, stok_minimum: 2 };
    const resultEmpty = validateBarangInput(inputEmpty);
    assert.equal(resultEmpty.isValid, false);
    assert.match(resultEmpty.errors[0], /Nama barang wajib diisi/);

    const inputNull = { nama_barang: null, stok_saat_ini: 5, stok_minimum: 2 };
    const resultNull = validateBarangInput(inputNull);
    assert.equal(resultNull.isValid, false);
  });

  it('AC 1.3: Menolak jika stok saat ini negatif atau bukan integer', () => {
    const inputNegative = { nama_barang: 'Minyak Goreng 1L', stok_saat_ini: -3, stok_minimum: 2 };
    const resultNegative = validateBarangInput(inputNegative);
    assert.equal(resultNegative.isValid, false);
    assert.match(resultNegative.errors[0], /Stok saat ini harus berupa bilangan bulat/);

    const inputFloat = { nama_barang: 'Minyak Goreng 1L', stok_saat_ini: 4.5, stok_minimum: 2 };
    const resultFloat = validateBarangInput(inputFloat);
    assert.equal(resultFloat.isValid, false);
  });

  it('AC 1.4: Menolak jika stok minimum negatif atau bukan integer', () => {
    const inputNegativeMin = { nama_barang: 'Gula Pasir 1kg', stok_saat_ini: 10, stok_minimum: -1 };
    const result = validateBarangInput(inputNegativeMin);
    assert.equal(result.isValid, false);
    assert.match(result.errors[0], /Stok minimum harus berupa bilangan bulat/);
  });

  it('AC 1.5: Validasi perubahan data barang menolak jika nama dikosongkan', () => {
    const updatePayload = { nama_barang: '', stok_saat_ini: 20, stok_minimum: 5 };
    const result = validateBarangInput(updatePayload);
    assert.equal(result.isValid, false);
    assert.equal(result.sanitized, null);
  });
});
