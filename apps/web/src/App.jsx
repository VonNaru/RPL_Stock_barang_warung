import { useEffect, useState } from "react";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackagePlus,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import BarangModal from "./components/BarangModal";
import BarangPage from "./components/BarangPage";
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import TransactionPage from "./components/TransactionPage";
import PesananPage from "./components/PesananPage";
import LoginPage from "./components/LoginPage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("warung_token");
  const savedUser = localStorage.getItem("warung_user");
  let userId = null;
  try {
    if (savedUser) userId = JSON.parse(savedUser)?.id_pengguna;
  } catch {}

  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.message || "Permintaan gagal diproses.");
  return body;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("warung_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [page, setPage] = useState("dashboard");
  const [barang, setBarang] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [transaction, setTransaction] = useState({
    id_barang: "",
    jenis_transaksi: "masuk",
    jumlah: 1,
    harga_beli: "",
    harga_jual: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [items, low, history, dashboardStats] = await Promise.all([
        request("/barang"),
        request("/barang/low-stock"),
        request("/transaksi"),
        request("/dashboard-stats").catch(() => null),
      ]);
      setBarang(items || []);
      setLowStock(low || []);
      setTransactions(history || []);
      setStats(dashboardStats);
      if (items && items.length > 0) {
        setTransaction((prev) => ({
          ...prev,
          id_barang: items[0].id_barang,
        }));
      } else {
        setTransaction((prev) => ({
          ...prev,
          id_barang: "",
        }));
      }
    } catch (error) {
      setNotice({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem("warung_user", JSON.stringify(res.user));
        if (res.token) {
          localStorage.setItem("warung_token", res.token);
        }
      }
    } catch (err) {
      setAuthError(err.message || "Gagal masuk. Periksa username dan password.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async ({ username, password, nama_lengkap, role }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password, nama_lengkap, role }),
      });
      // Otomatis login dengan kredensial akun yang baru didaftarkan
      await handleLogin({ username, password });
      setNotice({
        type: "success",
        message: `Akun "${nama_lengkap}" (${username}) berhasil dibuat! Toko baru Anda siap digunakan.`,
      });
    } catch (err) {
      setAuthError(err.message || "Gagal mendaftarkan akun baru.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await request("/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      setUser(null);
      localStorage.removeItem("warung_user");
      localStorage.removeItem("warung_token");
      setNotice(null);
      setBarang([]);
      setLowStock([]);
      setTransactions([]);
      setStats(null);
      setTransaction({
        id_barang: "",
        jenis_transaksi: "masuk",
        jumlah: 1,
        harga_beli: "",
        harga_jual: "",
      });
    }
  };

  const saveItem = async (form) => {
    try {
      await request(
        modal?.id_barang ? `/barang/${modal.id_barang}` : "/barang",
        {
          method: modal?.id_barang ? "PUT" : "POST",
          body: JSON.stringify(form),
        },
      );
      setModal(null);
      setNotice({ type: "success", message: "Data barang berhasil disimpan." });
      load();
    } catch (error) {
      setNotice({ type: "error", message: error.message });
    }
  };

  const saveTransaction = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        id_barang: transaction.id_barang,
        jenis_transaksi: transaction.jenis_transaksi,
        jumlah: Number(transaction.jumlah) || 1,
      };

      if (transaction.jenis_transaksi === "masuk") {
        if (
          transaction.harga_beli !== "" &&
          transaction.harga_beli !== undefined
        ) {
          payload.harga_beli = Number(transaction.harga_beli);
        }
        if (
          transaction.harga_jual !== "" &&
          transaction.harga_jual !== undefined
        ) {
          payload.harga_jual = Number(transaction.harga_jual);
        }
      } else {
        if (
          transaction.harga_jual !== "" &&
          transaction.harga_jual !== undefined
        ) {
          payload.harga_jual = Number(transaction.harga_jual);
        }
      }

      await request("/transaksi", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNotice({
        type: "success",
        message: "Transaksi berhasil dicatat dan stok diperbarui.",
      });

      setTransaction((prev) => ({
        ...prev,
        jumlah: 1,
        harga_beli: "",
        harga_jual: "",
      }));
      load();
    } catch (error) {
      setNotice({ type: "error", message: error.message });
    }
  };

  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={authLoading}
        error={authError}
        onClearError={() => setAuthError(null)}
      />
    );
  }

  const nav = [
    { key: "dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { key: "barang", label: "Master Barang", icon: Boxes },
    { key: "transaksi", label: "Transaksi In / Out", icon: PackagePlus },
    { key: "pesanan", label: "Pesanan", icon: Package },
    { key: "riwayat", label: "Riwayat Transaksi", icon: RefreshCw },
  ];
  const title = nav.find((item) => item.key === page)?.label;

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <aside
        className={`fixed inset-y-0 left-0 z-10 w-64 border-r border-[#dfe8df] bg-[#eef4ed] p-6 transition-transform md:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173f2a] text-white shadow-md shadow-emerald-950/20">
            <Boxes size={21} />
          </div>
          <div>
            <p className="display font-bold">Warung Stok</p>
            <p className="text-xs text-slate-500">Manajemen inventaris</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {nav.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setPage(key);
                setMobileNav(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${page === key ? "bg-[#173f2a] text-white shadow-md" : "text-slate-600 hover:bg-white"}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* User Card in Sidebar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-[#dfe8df] bg-white/95 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800">
                  {user?.nama_lengkap || user?.username}
                </p>
                <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {user?.role || "kasir"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar / Logout"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="grain absolute bottom-0 left-0 right-0 h-40 opacity-60" />
      </aside>

      <main className="md:ml-64">
        <header className="flex items-center justify-between border-b border-[#e1e8e1] bg-white/80 px-5 py-4 backdrop-blur md:px-10">
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="rounded-lg p-2 md:hidden"
          >
            <Menu size={21} />
          </button>
          <div className="hidden md:block">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">
              Sistem Manajemen
            </p>
            <h1 className="display mt-1 text-xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
              Segarkan
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
              title="Keluar dari sistem"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 md:p-10">
          {notice && (
            <div
              className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-sm font-semibold ${notice.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
            >
              {notice.message}
              <button onClick={() => setNotice(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          {page === "dashboard" && (
            <Dashboard
              lowStock={lowStock}
              barang={barang}
              transactions={transactions}
              stats={stats}
            />
          )}
          {page === "barang" && (
            <BarangPage
              barang={barang}
              onAdd={() => setModal({})}
              onEdit={setModal}
            />
          )}
          {page === "transaksi" && (
            <TransactionPage
              barang={barang}
              transaction={transaction}
              setTransaction={setTransaction}
              onSubmit={saveTransaction}
            />
          )}
          {page === "pesanan" && (
            <PesananPage
              barang={barang}
              onRefresh={load}
              notify={(type, message) => setNotice({ type, message })}
            />
          )}
          {page === "riwayat" && <History transactions={transactions} />}
        </div>
      </main>

      {modal && (
        <BarangModal
          item={modal.id_barang ? modal : null}
          onClose={() => setModal(null)}
          onSave={saveItem}
        />
      )}
    </div>
  );
}
