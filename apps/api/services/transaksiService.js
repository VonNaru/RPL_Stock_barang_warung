/**
 * Service untuk aturan bisnis Transaksi Stok (Masuk & Keluar)
 */

export const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

export const validateTransaksiInput = ({ id_barang, jenis_transaksi, jumlah }) => {
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

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      id_barang: id_barang.trim(),
      jenis_transaksi,
      jumlah: Number(jumlah)
    } : null
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
