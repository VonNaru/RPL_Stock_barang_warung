/**
 * Helper pemformatan mata uang Rupiah
 * Menggunakan Intl.NumberFormat('id-ID')
 */
export const formatRupiah = (value) => {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};
