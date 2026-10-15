import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStockMutation,
  validateTransaksiInput
} from '../apps/api/services/transaksiService.js';

describe('User Story 4: Transaksi Stok Keluar (Penjualan / Rusak) & Proteksi Stok Minus', () => {
  it('AC 4.1: Memvalidasi payload transaksi barang keluar yang valid', () => {
    const payload = {
      id_barang: 'b788c-item-02',
      jenis_transaksi: 'keluar',
      jumlah: 3
    };

    const validation = validateTransaksiInput(payload);
    assert.equal(validation.isValid, true);
    assert.deepEqual(validation.sanitized, payload);
  });

  it('AC 4.2: Berhasil mengurangi stok ketika persediaan mencukupi (stok > jumlah keluar)', () => {
    const result = calculateStockMutation({
      currentStock: 20,
      jenis_transaksi: 'keluar',
      jumlah: 6
    });

    assert.equal(result.previousStock, 20);
    assert.equal(result.mutatedQuantity, 6);
    assert.equal(result.newStock, 14);
    assert.equal(result.jenis_transaksi, 'keluar');
  });

  it('AC 4.3: Mengizinkan transaksi keluar tepat menghabiskan sisa persediaan (stok == jumlah keluar)', () => {
    const result = calculateStockMutation({
      currentStock: 5,
      jenis_transaksi: 'keluar',
      jumlah: 5
    });

    assert.equal(result.previousStock, 5);
    assert.equal(result.newStock, 0);
  });

  it('AC 4.4: Menolak transaksi keluar jika kuantitas melebihi stok yang ada (stok tidak cukup)', () => {
    assert.throws(
      () => {
        calculateStockMutation({
          currentStock: 4,
          jenis_transaksi: 'keluar',
          jumlah: 10
        });
      },
      (err) => {
        assert.equal(err.code, 'STOK_TIDAK_CUKUP');
        assert.match(err.message, /Stok tidak mencukupi untuk transaksi keluar/);
        return true;
      }
    );
  });

  it('AC 4.4: Menolak transaksi keluar saat stok awal sudah habis / kosong (0)', () => {
    assert.throws(
      () => {
        calculateStockMutation({
          currentStock: 0,
          jenis_transaksi: 'keluar',
          jumlah: 1
        });
      },
      (err) => {
        assert.equal(err.code, 'STOK_TIDAK_CUKUP');
        return true;
      }
    );
  });

  it('AC 4.5: Menolak transaksi keluar jika jumlah adalah bilangan desimal atau non-positif', () => {
    const validationZero = validateTransaksiInput({
      id_barang: 'item-01',
      jenis_transaksi: 'keluar',
      jumlah: 0
    });
    assert.equal(validationZero.isValid, false);

    const validationFloat = validateTransaksiInput({
      id_barang: 'item-01',
      jenis_transaksi: 'keluar',
      jumlah: 2.5
    });
    assert.equal(validationFloat.isValid, false);
  });
});
