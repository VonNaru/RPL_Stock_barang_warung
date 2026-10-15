/**
 * Service untuk aturan bisnis Manajemen Pesanan Pelanggan (Pre-Order / Booking)
 */

export const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

export const validatePesananInput = ({
  nama_pelanggan,
  id_barang,
  jumlah_pesanan,
  catatan
}) => {
  const errors = [];

  if (typeof nama_pelanggan !== 'string' || !nama_pelanggan.trim()) {
    errors.push('Nama pelanggan wajib diisi.');
  }

  if (!id_barang || typeof id_barang !== 'string' || !id_barang.trim()) {
    errors.push('Barang pesanan wajib dipilih.');
  }

  if (!isPositiveInteger(jumlah_pesanan)) {
    errors.push('Jumlah pesanan harus berupa bilangan bulat positif (> 0).');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      nama_pelanggan: nama_pelanggan.trim(),
      id_barang: id_barang.trim(),
      jumlah_pesanan: Number(jumlah_pesanan),
      catatan: typeof catatan === 'string' && catatan.trim() ? catatan.trim() : null
    } : null
  };
};

export const determineInitialOrderStatus = ({ currentStock, jumlah_pesanan }) => {
  if (!Number.isInteger(currentStock) || currentStock < 0) {
    throw new Error('Data stok barang tidak valid.');
  }

  if (!isPositiveInteger(jumlah_pesanan)) {
    throw new Error('Jumlah pesanan tidak valid.');
  }

  return currentStock >= jumlah_pesanan ? 'Siap Diambil' : 'Menunggu Stok';
};

export const canCompleteOrder = (order, currentStock) => {
  if (!order) {
    return { canComplete: false, reason: 'Pesanan tidak ditemukan.' };
  }

  if (['Selesai', 'Dibatalkan'].includes(order.status_pesanan)) {
    return {
      canComplete: false,
      reason: 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah.'
    };
  }

  if (!Number.isInteger(currentStock) || currentStock < order.jumlah_pesanan) {
    return {
      canComplete: false,
      reason: 'Stok tidak mencukupi untuk menyelesaikan pesanan ini.'
    };
  }

  return { canComplete: true };
};

export const canCancelOrder = (order) => {
  if (!order) {
    return { canCancel: false, reason: 'Pesanan tidak ditemukan.' };
  }

  if (['Selesai', 'Dibatalkan'].includes(order.status_pesanan)) {
    return {
      canCancel: false,
      reason: 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah.'
    };
  }

  return { canCancel: true };
};

export const processOrderCompletion = ({ order, currentStock }) => {
  const check = canCompleteOrder(order, currentStock);
  if (!check.canComplete) {
    const error = new Error(check.reason);
    error.status = 400;
    throw error;
  }

  return {
    orderId: order.id_pesanan,
    newOrderStatus: 'Selesai',
    previousStock: currentStock,
    deductedQuantity: order.jumlah_pesanan,
    newStock: currentStock - order.jumlah_pesanan
  };
};
