/**
 * Service untuk aturan bisnis Master Barang dan Status Stok
 */

export const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

export const validateBarangInput = ({ nama_barang, stok_saat_ini = 0, stok_minimum = 0 }) => {
  const errors = [];

  if (typeof nama_barang !== 'string' || !nama_barang.trim()) {
    errors.push('Nama barang wajib diisi dan tidak boleh hanya berupa spasi.');
  }

  if (!isNonNegativeInteger(stok_saat_ini)) {
    errors.push('Stok saat ini harus berupa bilangan bulat lebih besar atau sama dengan 0.');
  }

  if (!isNonNegativeInteger(stok_minimum)) {
    errors.push('Stok minimum harus berupa bilangan bulat lebih besar atau sama dengan 0.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      nama_barang: nama_barang.trim(),
      stok_saat_ini: Number(stok_saat_ini),
      stok_minimum: Number(stok_minimum)
    } : null
  };
};

export const checkStockStatus = (stokSaatIni, stokMinimum) => {
  if (stokSaatIni <= stokMinimum) {
    return 'Stok rendah';
  }
  return 'Aman';
};

export const filterLowStock = (barangList = []) => {
  return barangList
    .filter((barang) => barang.stok_saat_ini <= barang.stok_minimum)
    .sort((a, b) => a.stok_saat_ini - b.stok_saat_ini);
};

export const calculateDashboardSummary = ({ barangList = [], transaksiList = [] }) => {
  const totalBarang = barangList.length;
  const lowStockItems = filterLowStock(barangList);
  const totalBarangLowStock = lowStockItems.length;

  const totalTransaksiMasuk = transaksiList.filter((item) => item.jenis_transaksi === 'masuk').length;
  const totalTransaksiKeluar = transaksiList.filter((item) => item.jenis_transaksi === 'keluar').length;

  const totalKuantitasMasuk = transaksiList
    .filter((item) => item.jenis_transaksi === 'masuk')
    .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

  const totalKuantitasKeluar = transaksiList
    .filter((item) => item.jenis_transaksi === 'keluar')
    .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

  return {
    totalBarang,
    totalBarangLowStock,
    totalTransaksiMasuk,
    totalTransaksiKeluar,
    totalKuantitasMasuk,
    totalKuantitasKeluar,
    isStokAman: totalBarangLowStock === 0
  };
};
