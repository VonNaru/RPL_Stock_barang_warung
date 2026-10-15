import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStockMutation,
  validateTransaksiInput
} from '../apps/api/services/transaksiService.js';

describe('User Story 3: Transaksi Stok Masuk (Restock / Kulakan Warung)', () => {
  it('AC 3.1: Memvalidasi payload transaksi barang masuk yang valid', () => {
    const payload = {
      id_barang: 'b788c-item-01',
      jenis_transaksi: 'masuk',
      jumlah: 25
    };

    const validation = validateTransaksiInput(payload);
    assert.equal(validation.isValid, true);
    assert.deepEqual(validation.sanitized, {
      id_barang: 'b788c-item-01',
      jenis_transaksi: 'masuk',
      jumlah: 25
    });
  });

  it('AC 3.2: Menghitung penambahan stok masuk dengan formula stok_baru = stok_sekarang + jumlah', () => {
    const currentStock = 10;
    const jumlahMasuk = 15;

    const result = calculateStockMutation({
      currentStock,
      jenis_transaksi: 'masuk',
      jumlah: jumlahMasuk
    });

    assert.equal(result.previousStock, 10);
    assert.equal(result.mutatedQuantity, 15);
    assert.equal(result.newStock, 25);
    assert.equal(result.jenis_transaksi, 'masuk');
  });

  it('AC 3.2: Menambah stok pada barang yang sebelumnya kosong (stok 0)', () => {
    const result = calculateStockMutation({
      currentStock: 0,
      jenis_transaksi: 'masuk',
      jumlah: 50
    });

    assert.equal(result.previousStock, 0);
    assert.equal(result.newStock, 50);
  });

  it('AC 3.3: Menolak transaksi masuk dengan jumlah bernilai 0 (nol)', () => {
    const validation = validateTransaksiInput({
      id_barang: 'item-01',
      jenis_transaksi: 'masuk',
      jumlah: 0
    });

    assert.equal(validation.isValid, false);
    assert.match(validation.errors[0], /Jumlah transaksi harus berupa bilangan bulat positif/);

    assert.throws(() => {
      calculateStockMutation({ currentStock: 10, jenis_transaksi: 'masuk', jumlah: 0 });
    }, /Jumlah mutasi harus berupa bilangan bulat positif/);
  });

  it('AC 3.4: Menolak transaksi masuk dengan jumlah bernilai negatif', () => {
    const validation = validateTransaksiInput({
      id_barang: 'item-01',
      jenis_transaksi: 'masuk',
      jumlah: -10
    });

    assert.equal(validation.isValid, false);
    assert.throws(() => {
      calculateStockMutation({ currentStock: 10, jenis_transaksi: 'masuk', jumlah: -5 });
    }, /Jumlah mutasi harus berupa bilangan bulat positif/);
  });

  it('AC 3.5: Menolak transaksi jika id_barang tidak ditentukan', () => {
    const validation = validateTransaksiInput({
      id_barang: '',
      jenis_transaksi: 'masuk',
      jumlah: 5
    });

    assert.equal(validation.isValid, false);
    assert.match(validation.errors[0], /Barang wajib dipilih/);
  });

  it('AC 3.6: Menolak jenis transaksi selain masuk atau keluar', () => {
    const validation = validateTransaksiInput({
      id_barang: 'item-01',
      jenis_transaksi: 'transfer',
      jumlah: 5
    });

    assert.equal(validation.isValid, false);
    assert.match(validation.errors[0], /Jenis transaksi harus 'masuk' atau 'keluar'/);
  });
});
