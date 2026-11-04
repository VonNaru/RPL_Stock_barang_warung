import { useState } from "react";
import {
  Boxes,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  Store,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage({
  onLogin,
  onRegister,
  loading,
  error,
  onClearError,
}) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regNama, setRegNama] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("pemilik");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    if (onClearError) onClearError();
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    onLogin({ username: username.trim(), password });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regNama.trim() || !regUsername.trim() || !regPassword) return;
    if (onRegister) {
      onRegister({
        nama_lengkap: regNama.trim(),
        username: regUsername.trim(),
        password: regPassword,
        role: regRole,
      });
    }
  };

  const fillDemoAccount = (demoUser, demoPass) => {
    switchMode("login");
    setUsername(demoUser);
    setPassword(demoPass);
    if (onClearError) onClearError();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173f2a] text-white shadow-lg shadow-emerald-950/20">
            <Boxes size={30} />
          </div>
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            Sistem Manajemen
          </span>
          <h1 className="display mt-2 text-2xl font-black text-slate-800 md:text-3xl">
            Warung Stok
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Masuk untuk mengelola katalog, transaksi, dan inventaris toko Anda"
              : "Daftar akun baru untuk mulai mencatat stok warung Anda sendiri"}
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-[#dfe8df] bg-white p-6 shadow-sm md:p-8">
          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition ${
                mode === "register"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Form Login */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error && onClearError) onClearError();
                    }}
                    required
                    placeholder="Masukkan username"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error && onClearError) onClearError();
                    }}
                    required
                    placeholder="Masukkan password"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-11 text-sm font-medium text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f2a] py-3 text-sm font-bold text-white shadow-md shadow-emerald-950/20 transition hover:bg-[#1f5439] active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Masuk ke Sistem
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Form Register */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Nama Lengkap / Nama Toko
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Store size={18} />
                  </div>
                  <input
                    type="text"
                    value={regNama}
                    onChange={(e) => {
                      setRegNama(e.target.value);
                      if (error && onClearError) onClearError();
                    }}
                    required
                    placeholder="Contoh: Toko Berkah / Budi Santoso"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      if (error && onClearError) onClearError();
                    }}
                    required
                    placeholder="Contoh: budi_warung (min. 3 karakter)"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (error && onClearError) onClearError();
                    }}
                    required
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-11 text-sm font-medium text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Peran / Hak Akses
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "pemilik", label: "Pemilik" },
                    { key: "admin", label: "Admin" },
                    { key: "kasir", label: "Kasir" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRegRole(r.key)}
                      className={`rounded-xl border py-2 text-center text-xs font-bold transition ${
                        regRole === r.key
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f2a] py-3 text-sm font-bold text-white shadow-md shadow-emerald-950/20 transition hover:bg-[#1f5439] active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    Daftar & Masuk ke Sistem
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className="mt-8 border-t border-slate-100 pt-5">
            <p className="mb-2 text-center text-xs font-semibold text-slate-400">
              Gunakan Akun Bawaan (Klik Cepat):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("admin", "admin123")}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="block font-bold">Admin (Toko 1)</span>
                <span className="text-[11px] text-slate-500">admin123</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("kasir", "kasir123")}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="block font-bold">Kasir (Toko 2)</span>
                <span className="text-[11px] text-slate-500">kasir123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Sistem Informasi Manajemen Stok Warung &copy; 2026
        </p>
      </div>
    </div>
  );
}
