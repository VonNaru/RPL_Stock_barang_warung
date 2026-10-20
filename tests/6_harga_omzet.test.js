import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateBarangInput, calculateDashboardSummary } from '../apps/api/services/barangService.js';
import { validateTransaksiInput } from '../apps/api/services/transaksiService.js';

describe('User Story 6: Pencatatan Harga Beli (Modal Kulakan), Harga Jual (Omzet), dan Dashboard Finansial', () => {
  it('AC 6.1: Validasi input master barang berhasil menyimpan harga_beli dan harga_jual', () => {
    const input = {
      nama_barang: 'Minyak Goreng Sania 2L',
      stok_saat_ini: 20,
      stok_minimum: 5,
      harga_beli: 32000,
      harga_jual: 36000
    };

    const result = validateBarangInput(input);
    assert.equal(result.isValid, true);
    assert.equal(result.sanitized.harga_beli, 32000);
    assert.equal(result.sanitized.harga_jual, 36000);
  });

  it('AC 6.2: Validasi master barang menolak jika harga_beli atau harga_jual bernilai negatif', () => {
    const inputNegBeli = {
      nama_barang: 'Gula Pasir 1kg',
      stok_saat_ini: 10,
      stok_minimum: 2,
      harga_beli: -15000,
      harga_jual: 18000
    };
    const resNegBeli = validateBarangInput(inputNegBeli);
    assert.equal(resNegBeli.isValid, false);
    assert.match(resNegBeli.errors[0], /Harga beli harus berupa angka lebih besar atau sama dengan 0/);

    const inputNegJual = {
      nama_barang: 'Gula Pasir 1kg',
      stok_saat_ini: 10,
      stok_minimum: 2,
      harga_beli: 15000,
      harga_jual: -500
    };
    const resNegJual = validateBarangInput(inputNegJual);
    assert.equal(resNegJual.isValid, false);
    assert.match(resNegJual.errors[0], /Harga jual harus berupa angka lebih besar atau sama dengan 0/);
  });

  it('AC 6.3: Validasi transaksi masuk dan keluar mendukung input harga_beli dan harga_jual', () => {
    const payloadMasuk = {
      id_barang: 'barang-01',
      jenis_transaksi: 'masuk',
      jumlah: 10,
      harga_beli: 25000,
      harga_jual: 28000
    };
    const resMasuk = validateTransaksiInput(payloadMasuk);
    assert.equal(resMasuk.isValid, true);
    assert.equal(resMasuk.sanitized.harga_beli, 25000);
    assert.equal(resMasuk.sanitized.harga_jual, 28000);

    const payloadKeluar = {
      id_barang: 'barang-01',
      jenis_transaksi: 'keluar',
      jumlah: 4,
      harga_jual: 28000
    };
    const resKeluar = validateTransaksiInput(payloadKeluar);
    assert.equal(resKeluar.isValid, true);
    assert.equal(resKeluar.sanitized.harga_jual, 28000);
  });

  it('AC 6.4: Validasi transaksi menolak harga negatif', () => {
    const payload = {
      id_barang: 'barang-01',
      jenis_transaksi: 'masuk',
      jumlah: 5,
      harga_beli: -1000
    };
    const res = validateTransaksiInput(payload);
    assert.equal(res.isValid, false);
    assert.match(res.errors[0], /Harga beli harus berupa angka lebih besar atau sama dengan 0/);
  });

  it('AC 6.5: calculateDashboardSummary menghitung 4 metrik finansial dan arus barang dengan tepat', () => {
    const barangList = [
      { id_barang: '1', nama_barang: 'Kopi', stok_saat_ini: 50, stok_minimum: 10, harga_beli: 12000, harga_jual: 15000 }
    ];

    const transaksiList = [
      { id_transaksi: 't1', jenis_transaksi: 'masuk', jumlah: 20, harga_beli: 12000, harga_jual: 0 },
      { id_transaksi: 't2', jenis_transaksi: 'masuk', jumlah: 30, harga_beli: 11500, harga_jual: 0 },
      { id_transaksi: 't3', jenis_transaksi: 'keluar', jumlah: 15, harga_beli: 0, harga_jual: 15000 },
      { id_transaksi: 't4', jenis_transaksi: 'keluar', jumlah: 10, harga_beli: 0, harga_jual: 16000 }
    ];

    const summary = calculateDashboardSummary({ barangList, transaksiList });

    // 1. Total Kuantitas Barang Masuk (20 + 30 = 50)
    assert.equal(summary.totalKuantitasMasuk, 50);

    // 2. Total Kuantitas Barang Keluar (15 + 10 = 25)
    assert.equal(summary.totalKuantitasKeluar, 25);

    // 3. Total Pengeluaran Kulakan ((20 * 12000) + (30 * 11500) = 240000 + 345000 = 585000)
    assert.equal(summary.totalPengeluaranKulakan, 585000);

    // 4. Total Omzet Penjualan ((15 * 15000) + (10 * 16000) = 225000 + 160000 = 385000)
    assert.equal(summary.totalOmzetPenjualan, 385000);
  });
});
