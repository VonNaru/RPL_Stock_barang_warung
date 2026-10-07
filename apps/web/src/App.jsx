import { useEffect, useState } from 'react';
import { Boxes, LayoutDashboard, Menu, Package, PackagePlus, RefreshCw, X } from 'lucide-react';
import BarangModal from './components/BarangModal';
import BarangPage from './components/BarangPage';
import Dashboard from './components/Dashboard';
import History from './components/History';
import TransactionPage from './components/TransactionPage';
import PesananPage from './components/PesananPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Permintaan gagal diproses.');
  return body;
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [barang, setBarang] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [transaction, setTransaction] = useState({ id_barang: '', jenis_transaksi: 'masuk', jumlah: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const [items, low, history] = await Promise.all([request('/barang'), request('/barang/low-stock'), request('/transaksi')]);
      setBarang(items);
      setLowStock(low);
      setTransactions(history);
      if (!transaction.id_barang && items[0]) setTransaction({ ...transaction, id_barang: items[0].id_barang });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveItem = async (form) => {
    try {
      await request(modal?.id_barang ? `/barang/${modal.id_barang}` : '/barang', { method: modal?.id_barang ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setModal(null);
      setNotice({ type: 'success', message: 'Data barang berhasil disimpan.' });
      load();
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    }
  };

  const saveTransaction = async (event) => {
    event.preventDefault();
    try {
      await request('/transaksi', { method: 'POST', body: JSON.stringify(transaction) });
      setNotice({ type: 'success', message: 'Transaksi berhasil dicatat dan stok diperbarui.' });
      setTransaction({ ...transaction, jumlah: 1 });
      load();
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    }
  };

  const nav = [
    { key: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { key: 'barang', label: 'Master Barang', icon: Boxes },
    { key: 'transaksi', label: 'Transaksi In / Out', icon: PackagePlus },
    { key: 'pesanan', label: 'Pesanan', icon: Package },
    { key: 'riwayat', label: 'Riwayat Transaksi', icon: RefreshCw },
  ];
  const title = nav.find((item) => item.key === page)?.label;

  return <div className="min-h-screen bg-[#f5f7f4]"><aside className={`fixed inset-y-0 left-0 z-10 w-64 border-r border-[#dfe8df] bg-[#eef4ed] p-6 transition-transform md:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173f2a] text-white"><Boxes size={21} /></div><div><p className="display font-bold">Warung Stok</p><p className="text-xs text-slate-500">Manajemen inventaris</p></div></div><nav className="mt-12 space-y-2">{nav.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => { setPage(key); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${page === key ? 'bg-[#173f2a] text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}><Icon size={18} />{label}</button>)}</nav><div className="grain absolute bottom-0 left-0 right-0 h-40 opacity-60" /></aside><main className="md:ml-64"><header className="flex items-center justify-between border-b border-[#e1e8e1] bg-white/80 px-5 py-4 backdrop-blur md:px-10"><button onClick={() => setMobileNav(!mobileNav)} className="rounded-lg p-2 md:hidden"><Menu size={21} /></button><div className="hidden md:block"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">Sistem Manajemen</p><h1 className="display mt-1 text-xl font-bold">{title}</h1></div><button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan</button></header><div className="mx-auto max-w-7xl p-5 md:p-10">{notice && <div className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-sm font-semibold ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{notice.message}<button onClick={() => setNotice(null)}><X size={16} /></button></div>}{page === 'dashboard' && <Dashboard lowStock={lowStock} barang={barang} transactions={transactions} />}{page === 'barang' && <BarangPage barang={barang} onAdd={() => setModal({})} onEdit={setModal} />}{page === 'transaksi' && <TransactionPage barang={barang} transaction={transaction} setTransaction={setTransaction} onSubmit={saveTransaction} />}{page === 'pesanan' && <PesananPage barang={barang} onRefresh={load} notify={(type, message) => setNotice({ type, message })} />}{page === 'riwayat' && <History transactions={transactions} />}</div></main>{modal && <BarangModal item={modal.id_barang ? modal : null} onClose={() => setModal(null)} onSave={saveItem} />}</div>;
}
