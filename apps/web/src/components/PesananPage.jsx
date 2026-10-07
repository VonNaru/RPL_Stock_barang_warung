import { useEffect, useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PesananPage({ barang = [], onRefresh, notify }) {
  const [pesananList, setPesananList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_pelanggan: '',
    id_barang: '',
    jumlah_pesanan: 1,
    catatan: ''
  });

  const fetchPesanan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pesanan`);
      if (!res.ok) throw new Error('Gagal mengambil data pesanan.');
      const data = await res.json();
      setPesananList(data);
    } catch (err) {
      notify?.('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPesanan();
  }, []);

  const handleRefreshAll = () => {
    fetchPesanan();
    if (onRefresh) onRefresh();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/pesanan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          NamaPelanggan: form.nama_pelanggan,
          IdBarang: form.id_barang,
          JumlahPesanan: Number(form.jumlah_pesanan),
          Catatan: form.catatan
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal mencatat pesanan.');
      notify?.('success', result.message || 'Pesanan berhasil dicatat.');
      setForm({ nama_pelanggan: '', id_barang: barang[0]?.id_barang || '', jumlah_pesanan: 1, catatan: '' });
      fetchPesanan();
      if (onRefresh) onRefresh();
    } catch (err) {
      notify?.('error', err.message);
    }
  };

  const handleSelesaikan = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menyelesaikan pesanan ini?')) return;
    try {
      const res = await fetch(`${API_URL}/pesanan/${id}/selesaikan`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menyelesaikan pesanan.');
      notify?.('success', result.message || 'Pesanan berhasil diselesaikan.');
      fetchPesanan();
      if (onRefresh) onRefresh();
    } catch (err) {
      notify?.('error', err.message);
    }
  };

  const handleBatalkan = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    try {
      const res = await fetch(`${API_URL}/pesanan/${id}/batalkan`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal membatalkan pesanan.');
      notify?.('success', result.message || 'Pesanan berhasil dibatalkan.');
      fetchPesanan();
      if (onRefresh) onRefresh();
    } catch (err) {
      notify?.('error', err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Menunggu Stok':
        return 'bg-amber-100 text-amber-800';
      case 'Siap Diambil':
        return 'bg-blue-100 text-blue-800';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800';
      case 'Dibatalkan':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Pre-order internal warung</p>
          <h2 className="display mt-1 flex items-center gap-3 text-3xl font-bold">
            <Package size={28} className="text-[#173f2a]" />
            Pesanan Pelanggan
          </h2>
        </div>
        <button
          onClick={handleRefreshAll}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-[#e1e8e1] bg-white p-6 shadow-sm md:p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Form Pesanan</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Nama Pelanggan
            <input
              type="text"
              required
              value={form.nama_pelanggan}
              onChange={(e) => setForm({ ...form, nama_pelanggan: e.target.value })}
              placeholder="Nama pelanggan..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Pilih Barang
            <select
              required
              value={form.id_barang}
              onChange={(e) => setForm({ ...form, id_barang: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            >
              <option value="">Pilih barang...</option>
              {barang.map((item) => (
                <option key={item.id_barang} value={item.id_barang}>
                  {item.nama_barang} (stok saat ini: {item.stok_saat_ini})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Jumlah Pesanan
            <input
              type="number"
              required
              min="1"
              value={form.jumlah_pesanan}
              onChange={(e) => setForm({ ...form, jumlah_pesanan: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Catatan (opsional)
            <input
              type="text"
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Catatan tambahan..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#173f2a] px-6 py-3 font-bold text-white hover:bg-[#0e2d1d] shadow-sm transition"
        >
          <Package size={18} /> Catat Pesanan
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[#e1e8e1] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-[#f8faf8] text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4">Nama Pelanggan</th>
              <th className="px-5 py-4">Barang</th>
              <th className="px-5 py-4">Jumlah</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Catatan</th>
              <th className="px-5 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pesananList.map((pesanan) => {
              const isFinished = pesanan.status_pesanan === 'Selesai' || pesanan.status_pesanan === 'Dibatalkan';
              return (
                <tr key={pesanan.id_pesanan}>
                  <td className="px-5 py-4 font-semibold text-slate-800">{pesanan.nama_pelanggan}</td>
                  <td className="px-5 py-4 font-semibold">{pesanan.tabel_barang?.nama_barang || 'Barang dihapus'}</td>
                  <td className="px-5 py-4 font-bold">{pesanan.jumlah_pesanan}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(pesanan.status_pesanan)}`}>
                      {pesanan.status_pesanan}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{pesanan.catatan || '-'}</td>
                  <td className="px-5 py-4 text-right">
                    {!isFinished && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSelesaikan(pesanan.id_pesanan)}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Selesaikan
                        </button>
                        <button
                          onClick={() => handleBatalkan(pesanan.id_pesanan)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
                        >
                          Batalkan
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!pesananList.length && <p className="p-10 text-center text-slate-500">Belum ada pesanan.</p>}
      </div>
    </>
  );
}
