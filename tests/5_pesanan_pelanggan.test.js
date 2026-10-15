import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canCancelOrder,
  canCompleteOrder,
  determineInitialOrderStatus,
  processOrderCompletion,
  validatePesananInput
} from '../apps/api/services/pesananService.js';

describe('User Story 5: Manajemen Pesanan Pelanggan (Pre-Order / Booking) & Otomasi Status', () => {
  it('AC 5.1: Memvalidasi input pesanan pelanggan yang lengkap dan valid', () => {
    const input = {
      nama_pelanggan: '  Ibu Siti  ',
      id_barang: 'barang-001',
      jumlah_pesanan: 3,
      catatan: '  Diambil sore jam 5  '
    };

    const validation = validatePesananInput(input);
    assert.equal(validation.isValid, true);
    assert.deepEqual(validation.sanitized, {
      nama_pelanggan: 'Ibu Siti',
      id_barang: 'barang-001',
      jumlah_pesanan: 3,
      catatan: 'Diambil sore jam 5'
    });
  });

  it('AC 5.1: Menolak pesanan jika nama pelanggan kosong atau jumlah non-positif', () => {
    const invalidName = validatePesananInput({
      nama_pelanggan: '',
      id_barang: 'b1',
      jumlah_pesanan: 2
    });
    assert.equal(invalidName.isValid, false);

    const invalidQty = validatePesananInput({
      nama_pelanggan: 'Pak Joko',
      id_barang: 'b1',
      jumlah_pesanan: 0
    });
    assert.equal(invalidQty.isValid, false);
  });

  it("AC 5.2: Menentukan status awal 'Siap Diambil' jika stok tersedia mencukupi jumlah pesanan", () => {
    const status = determineInitialOrderStatus({ currentStock: 10, jumlah_pesanan: 4 });
    assert.equal(status, 'Siap Diambil');

    // Kondisi tepat sama dengan stok
    const statusExact = determineInitialOrderStatus({ currentStock: 4, jumlah_pesanan: 4 });
    assert.equal(statusExact, 'Siap Diambil');
  });

  it("AC 5.2: Menentukan status awal 'Menunggu Stok' jika stok barang tidak mencukupi", () => {
    const status = determineInitialOrderStatus({ currentStock: 2, jumlah_pesanan: 5 });
    assert.equal(status, 'Menunggu Stok');

    const statusZero = determineInitialOrderStatus({ currentStock: 0, jumlah_pesanan: 1 });
    assert.equal(statusZero, 'Menunggu Stok');
  });

  it('AC 5.3: Mengizinkan penyelesaian pesanan jika stok saat ini mencukupi', () => {
    const order = { id_pesanan: 'p-01', jumlah_pesanan: 3, status_pesanan: 'Siap Diambil' };
    const currentStock = 5;

    const check = canCompleteOrder(order, currentStock);
    assert.equal(check.canComplete, true);

    const completion = processOrderCompletion({ order, currentStock });
    assert.equal(completion.newOrderStatus, 'Selesai');
    assert.equal(completion.newStock, 2);
  });

  it('AC 5.3: Menolak penyelesaian pesanan jika stok saat ini tidak mencukupi', () => {
    const order = { id_pesanan: 'p-02', jumlah_pesanan: 5, status_pesanan: 'Menunggu Stok' };
    const currentStock = 2;

    const check = canCompleteOrder(order, currentStock);
    assert.equal(check.canComplete, false);
    assert.match(check.reason, /Stok tidak mencukupi/);

    assert.throws(() => {
      processOrderCompletion({ order, currentStock });
    }, /Stok tidak mencukupi/);
  });

  it('AC 5.3: Menolak penyelesaian pesanan yang sudah berstatus Selesai atau Dibatalkan', () => {
    const completedOrder = { id_pesanan: 'p-03', jumlah_pesanan: 1, status_pesanan: 'Selesai' };
    const cancelledOrder = { id_pesanan: 'p-04', jumlah_pesanan: 1, status_pesanan: 'Dibatalkan' };

    assert.equal(canCompleteOrder(completedOrder, 10).canComplete, false);
    assert.equal(canCompleteOrder(cancelledOrder, 10).canComplete, false);
  });

  it('AC 5.4: Mengizinkan pembatalan pada pesanan aktif dan menolak pada pesanan non-aktif', () => {
    const activeOrder = { id_pesanan: 'p-05', status_pesanan: 'Menunggu Stok' };
    assert.equal(canCancelOrder(activeOrder).canCancel, true);

    const completedOrder = { id_pesanan: 'p-06', status_pesanan: 'Selesai' };
    assert.equal(canCancelOrder(completedOrder).canCancel, false);

    const cancelledOrder = { id_pesanan: 'p-07', status_pesanan: 'Dibatalkan' };
    assert.equal(canCancelOrder(cancelledOrder).canCancel, false);
  });
});
