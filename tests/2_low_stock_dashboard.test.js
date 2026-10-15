import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDashboardSummary,
  checkStockStatus,
  filterLowStock
} from '../apps/api/services/barangService.js';

describe('User Story 2: Peringatan Stok Minimum (Low-Stock Alert) & Ringkasan Dashboard', () => {
  it("AC 2.1: Menandai 'Stok rendah' jika stok_saat_ini berada tepat di ambang batas minimum (stok == minimum)", () => {
    const status = checkStockStatus(5, 5);
    assert.equal(status, 'Stok rendah');
  });

  it("AC 2.1: Menandai 'Stok rendah' jika stok_saat_ini di bawah batas minimum (stok < minimum)", () => {
    const status = checkStockStatus(2, 5);
    assert.equal(status, 'Stok rendah');
  });

  it("AC 2.1: Menandai 'Stok rendah' jika stok kosong (0) dan batas minimum positif", () => {
    const status = checkStockStatus(0, 3);
    assert.equal(status, 'Stok rendah');
  });

  it("AC 2.2: Menandai 'Aman' jika stok_saat_ini melebihi batas minimum (stok > minimum)", () => {
    const status = checkStockStatus(10, 5);
    assert.equal(status, 'Aman');
  });

  it('AC 2.3: filterLowStock hanya mengembalikan daftar barang yang memerlukan restock', () => {
    const barangList = [
      { id_barang: '1', nama_barang: 'Beras 5kg', stok_saat_ini: 10, stok_minimum: 5 },
      { id_barang: '2', nama_barang: 'Minyak Goreng 1L', stok_saat_ini: 2, stok_minimum: 5 },
      { id_barang: '3', nama_barang: 'Gula Pasir 1kg', stok_saat_ini: 4, stok_minimum: 4 },
      { id_barang: '4', nama_barang: 'Kopi Bubuk', stok_saat_ini: 20, stok_minimum: 8 }
    ];

    const lowStock = filterLowStock(barangList);
    assert.equal(lowStock.length, 2);
    const lowStockIds = lowStock.map((b) => b.id_barang);
    assert.ok(lowStockIds.includes('2'));
    assert.ok(lowStockIds.includes('3'));
    assert.ok(!lowStockIds.includes('1'));
  });

  it('AC 2.4: filterLowStock mengurutkan barang low-stock berdasarkan sisa stok terkecil terlebih dahulu', () => {
    const barangList = [
      { id_barang: 'a', nama_barang: 'Telur', stok_saat_ini: 4, stok_minimum: 5 },
      { id_barang: 'b', nama_barang: 'Garam', stok_saat_ini: 1, stok_minimum: 5 },
      { id_barang: 'c', nama_barang: 'Terigu', stok_saat_ini: 3, stok_minimum: 5 }
    ];

    const lowStock = filterLowStock(barangList);
    assert.equal(lowStock[0].id_barang, 'b'); // stok 1
    assert.equal(lowStock[1].id_barang, 'c'); // stok 3
    assert.equal(lowStock[2].id_barang, 'a'); // stok 4
  });

  it('AC 2.5: calculateDashboardSummary menghitung seluruh metrik inventaris dan transaksi dengan tepat', () => {
    const barangList = [
      { id_barang: '1', nama_barang: 'Beras', stok_saat_ini: 12, stok_minimum: 5 },
      { id_barang: '2', nama_barang: 'Gula', stok_saat_ini: 1, stok_minimum: 5 }
    ];
    const transaksiList = [
      { id_transaksi: 't1', jenis_transaksi: 'masuk', jumlah: 10 },
      { id_transaksi: 't2', jenis_transaksi: 'keluar', jumlah: 3 },
      { id_transaksi: 't3', jenis_transaksi: 'keluar', jumlah: 2 }
    ];

    const summary = calculateDashboardSummary({ barangList, transaksiList });
    assert.equal(summary.totalBarang, 2);
    assert.equal(summary.totalBarangLowStock, 1);
    assert.equal(summary.totalTransaksiMasuk, 1);
    assert.equal(summary.totalTransaksiKeluar, 2);
    assert.equal(summary.totalKuantitasMasuk, 10);
    assert.equal(summary.totalKuantitasKeluar, 5);
    assert.equal(summary.isStokAman, false);
  });
});
