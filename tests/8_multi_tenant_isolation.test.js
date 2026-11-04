import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { authMiddleware, requireAuth } from '../apps/api/middleware/authMiddleware.js';
import { calculateDashboardSummary, filterLowStock } from '../apps/api/services/barangService.js';

describe('User Story 8: Isolasi Data Stok & Multi-Tenant per Akun Pengguna', () => {
  it('AC 8.1: authMiddleware berhasil mengekstrak userId dari header x-user-id', () => {
    const req = {
      headers: { 'x-user-id': 'user-uuid-111' },
      query: {},
      body: {}
    };
    let calledNext = false;
    authMiddleware(req, {}, () => { calledNext = true; });

    assert.equal(calledNext, true);
    assert.equal(req.userId, 'user-uuid-111');
  });

  it('AC 8.2: authMiddleware berhasil mendekode userId dari header Authorization: Bearer <base64>', () => {
    const token = Buffer.from('user-uuid-222:1790840585').toString('base64');
    const req = {
      headers: { authorization: `Bearer ${token}` },
      query: {},
      body: {}
    };
    let calledNext = false;
    authMiddleware(req, {}, () => { calledNext = true; });

    assert.equal(calledNext, true);
    assert.equal(req.userId, 'user-uuid-222');
  });

  it('AC 8.3: authMiddleware berhasil mengekstrak userId dari query parameter id_pengguna', () => {
    const req = {
      headers: {},
      query: { id_pengguna: 'user-uuid-333' },
      body: {}
    };
    let calledNext = false;
    authMiddleware(req, {}, () => { calledNext = true; });

    assert.equal(calledNext, true);
    assert.equal(req.userId, 'user-uuid-333');
  });

  it('AC 8.4: authMiddleware menetapkan userId = null jika tidak ada kredensial yang dikirimkan', () => {
    const req = {
      headers: {},
      query: {},
      body: {}
    };
    authMiddleware(req, {}, () => {});
    assert.equal(req.userId, null);
  });

  it('AC 8.5: requireAuth memblokir dengan status 401 jika pengguna belum terautentikasi', () => {
    const req = { userId: null };
    let responseStatus = null;
    let responseJson = null;

    const res = {
      status(code) {
        responseStatus = code;
        return {
          json(payload) {
            responseJson = payload;
          }
        };
      }
    };

    requireAuth(req, res, () => {});
    assert.equal(responseStatus, 401);
    assert.match(responseJson.message, /Akses ditolak/);
  });

  it('AC 8.6: requireAuth mengizinkan akses ke next() jika req.userId valid', () => {
    const req = { userId: 'user-uuid-444' };
    let calledNext = false;

    requireAuth(req, {}, () => { calledNext = true; });
    assert.equal(calledNext, true);
  });

  it('AC 8.7: Simulasi isolasi data: Barang User A dan User B terpisah total', () => {
    const allBarang = [
      { id_barang: 'b1', nama_barang: 'Beras Ramos (Admin)', id_pengguna: 'user-admin', stok_saat_ini: 10, stok_minimum: 3 },
      { id_barang: 'b2', nama_barang: 'Minyak Goreng (Admin)', id_pengguna: 'user-admin', stok_saat_ini: 2, stok_minimum: 5 },
      { id_barang: 'b3', nama_barang: 'Indomie Goreng (Kasir)', id_pengguna: 'user-kasir', stok_saat_ini: 20, stok_minimum: 5 },
      { id_barang: 'b4', nama_barang: 'Kopi Kapal Api (Kasir)', id_pengguna: 'user-kasir', stok_saat_ini: 1, stok_minimum: 3 }
    ];

    // Filter untuk Admin
    const barangAdmin = allBarang.filter(b => b.id_pengguna === 'user-admin');
    assert.equal(barangAdmin.length, 2);
    assert.equal(barangAdmin.every(b => b.id_pengguna === 'user-admin'), true);

    // Filter low stock Admin
    const lowAdmin = filterLowStock(barangAdmin);
    assert.equal(lowAdmin.length, 1);
    assert.equal(lowAdmin[0].nama_barang, 'Minyak Goreng (Admin)');

    // Filter untuk Kasir
    const barangKasir = allBarang.filter(b => b.id_pengguna === 'user-kasir');
    assert.equal(barangKasir.length, 2);
    assert.equal(barangKasir.every(b => b.id_pengguna === 'user-kasir'), true);

    // Filter low stock Kasir
    const lowKasir = filterLowStock(barangKasir);
    assert.equal(lowKasir.length, 1);
    assert.equal(lowKasir[0].nama_barang, 'Kopi Kapal Api (Kasir)');
  });

  it('AC 8.8: Ringkasan finansial dan omzet terisolasi per akun pengguna', () => {
    const transaksiAdmin = [
      { jenis_transaksi: 'masuk', jumlah: 10, harga_beli: 10000, harga_jual: 12000, id_pengguna: 'user-admin' },
      { jenis_transaksi: 'keluar', jumlah: 5, harga_beli: 10000, harga_jual: 12000, id_pengguna: 'user-admin' }
    ];

    const transaksiKasir = [
      { jenis_transaksi: 'masuk', jumlah: 50, harga_beli: 2000, harga_jual: 3000, id_pengguna: 'user-kasir' },
      { jenis_transaksi: 'keluar', jumlah: 20, harga_beli: 2000, harga_jual: 3000, id_pengguna: 'user-kasir' }
    ];

    const summaryAdmin = calculateDashboardSummary({
      barangList: [{ stok_saat_ini: 5, stok_minimum: 2 }],
      transaksiList: transaksiAdmin
    });

    const summaryKasir = calculateDashboardSummary({
      barangList: [{ stok_saat_ini: 30, stok_minimum: 10 }],
      transaksiList: transaksiKasir
    });

    // Admin: Pengeluaran 10 * 10.000 = 100.000, Omzet 5 * 12.000 = 60.000
    assert.equal(summaryAdmin.totalPengeluaranKulakan, 100000);
    assert.equal(summaryAdmin.totalOmzetPenjualan, 60000);
    assert.equal(summaryAdmin.totalKuantitasMasuk, 10);
    assert.equal(summaryAdmin.totalKuantitasKeluar, 5);

    // Kasir: Pengeluaran 50 * 2.000 = 100.000, Omzet 20 * 3.000 = 60.000
    assert.equal(summaryKasir.totalPengeluaranKulakan, 100000);
    assert.equal(summaryKasir.totalOmzetPenjualan, 60000);
    assert.equal(summaryKasir.totalKuantitasMasuk, 50);
    assert.equal(summaryKasir.totalKuantitasKeluar, 20);
  });
});
