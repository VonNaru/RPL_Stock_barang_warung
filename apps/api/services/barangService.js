/**
 * Service untuk aturan bisnis Master Barang dan Status Stok
 */

export const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

export const isNonNegativeNumber = (value) => {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value >= 0;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return !Number.isNaN(parsed) && parsed >= 0;
  }
  return false;
};

export const validateBarangInput = ({
  nama_barang,
  stok_saat_ini = 0,
  stok_minimum = 0,
  harga_beli,
  harga_jual
}) => {
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

  if (harga_beli !== undefined && harga_beli !== null && harga_beli !== '' && !isNonNegativeNumber(harga_beli)) {
    errors.push('Harga beli harus berupa angka lebih besar atau sama dengan 0.');
  }

  if (harga_jual !== undefined && harga_jual !== null && harga_jual !== '' && !isNonNegativeNumber(harga_jual)) {
    errors.push('Harga jual harus berupa angka lebih besar atau sama dengan 0.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null
    };
  }

  const sanitized = {
    nama_barang: nama_barang.trim(),
    stok_saat_ini: Number(stok_saat_ini),
    stok_minimum: Number(stok_minimum)
  };

  if (harga_beli !== undefined && harga_beli !== null && harga_beli !== '') {
    sanitized.harga_beli = Number(harga_beli);
  }

  if (harga_jual !== undefined && harga_jual !== null && harga_jual !== '') {
    sanitized.harga_jual = Number(harga_jual);
  }

  return {
    isValid: true,
    errors: [],
    sanitized
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

  const totalPengeluaranKulakan = transaksiList
    .filter((item) => item.jenis_transaksi === 'masuk')
    .reduce((sum, item) => sum + ((Number(item.jumlah) || 0) * (Number(item.harga_beli) || 0)), 0);

  const totalOmzetPenjualan = transaksiList
    .filter((item) => item.jenis_transaksi === 'keluar')
    .reduce((sum, item) => sum + ((Number(item.jumlah) || 0) * (Number(item.harga_jual) || 0)), 0);

  return {
    totalBarang,
    totalBarangLowStock,
    totalTransaksiMasuk,
    totalTransaksiKeluar,
    totalKuantitasMasuk,
    totalKuantitasKeluar,
    totalPengeluaranKulakan,
    totalOmzetPenjualan,
    isStokAman: totalBarangLowStock === 0
  };
};
