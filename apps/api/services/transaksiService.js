/**
 * Service untuk aturan bisnis Transaksi Stok (Masuk & Keluar)
 */

export const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

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

export const validateTransaksiInput = ({ id_barang, jenis_transaksi, jumlah, harga_beli, harga_jual }) => {
  const errors = [];

  if (!id_barang || typeof id_barang !== 'string' || !id_barang.trim()) {
    errors.push('Barang wajib dipilih.');
  }

  if (!['masuk', 'keluar'].includes(jenis_transaksi)) {
    errors.push("Jenis transaksi harus 'masuk' atau 'keluar'.");
  }

  if (!isPositiveInteger(jumlah)) {
    errors.push('Jumlah transaksi harus berupa bilangan bulat positif (> 0).');
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
    id_barang: id_barang.trim(),
    jenis_transaksi,
    jumlah: Number(jumlah)
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

export const calculateStockMutation = ({ currentStock, jenis_transaksi, jumlah }) => {
  if (!Number.isInteger(currentStock) || currentStock < 0) {
    throw new Error('Stok saat ini tidak valid.');
  }

  if (!isPositiveInteger(jumlah)) {
    throw new Error('Jumlah mutasi harus berupa bilangan bulat positif (> 0).');
  }

  if (jenis_transaksi === 'masuk') {
    return {
      previousStock: currentStock,
      mutatedQuantity: jumlah,
      newStock: currentStock + jumlah,
      jenis_transaksi: 'masuk'
    };
  }

  if (jenis_transaksi === 'keluar') {
    if (currentStock < jumlah) {
      const error = new Error('Stok tidak mencukupi untuk transaksi keluar.');
      error.code = 'STOK_TIDAK_CUKUP';
      throw error;
    }

    return {
      previousStock: currentStock,
      mutatedQuantity: jumlah,
      newStock: currentStock - jumlah,
      jenis_transaksi: 'keluar'
    };
  }

  throw new Error("Jenis transaksi tidak dikenal. Gunakan 'masuk' atau 'keluar'.");
};
