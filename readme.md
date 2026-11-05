<h1 align="center">Sistem Informasi Manajemen Stok Warung (Multi-Tenant)</h1>

> Aplikasi web full-stack modern yang dirancang untuk mendigitalisasi proses inventaris warung kelontong dan toko retail. Dilengkapi autentikasi terenkripsi, isolasi data stok per akun pengguna (*multi-tenant*), pencatatan arus modal kulakan dan omzet penjualan, manajemen pesanan (*pre-order*), serta peringatan dini saat stok menipis (*low-stock alert*).

---

## 📌 Daftar Isi
- [Latar Belakang & Fitur Utama](#-fitur-utama-sistem)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Panduan Instalasi Fresh Clone Repo](#-panduan-instalasi-fresh-clone-repo)
- [Konfigurasi Basis Data Supabase](#-konfigurasi-basis-data-supabase)
- [Konfigurasi Environment Variable (.env)](#-konfigurasi-environment-variable-env)
- [Akses Akun Demo Bawaan](#-akses-akun-demo-bawaan)
- [Menjalankan Aplikasi di Lingkungan Lokal](#-menjalankan-aplikasi-di-lingkungan-lokal)
- [Menjalankan Automated Tests](#-menjalankan-automated-tests)
- [Kompilasi Build & Panduan Deploy ke Produksi](#-kompilasi-build--panduan-deploy-ke-produksi)
- [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)
- [Panduan Pull Request & Kontribusi](#-panduan-pull-request--kontribusi)

---

## 🎯 Fitur Utama Sistem

1. **Autentikasi & Multi-Tenant (Stok Terpisah per Akun):**
   - Halaman login & pendaftaran akun mandiri (*Register*).
   - Password diamankan dengan hashing berbasis `scrypt` dan *unique salt*.
   - Setiap pengguna memiliki stok barang, riwayat transaksi, dan laporan finansial sendiri tanpa saling bercampur.
2. **Dashboard & Ringkasan Finansial Real-time:**
   - 4 Kartu Statistik: Total Kuantitas Masuk, Total Kuantitas Keluar, Total Pengeluaran Kulakan (Rp), dan Total Omzet Penjualan (Rp).
   - Indikator barang kritis (*low-stock alert*) saat persediaan menyentuh atau di bawah stok minimum.
3. **Manajemen Master Barang (Katalog):**
   - Tambah, edit, dan pantau barang dagangan lengkap dengan harga beli (modal) dan harga jual (omzet).
   - Penentuan status otomatis: *Aman* atau *Stok rendah*.
4. **Modul Transaksi Masuk & Keluar:**
   - **Transaksi Masuk (Restok / Kulakan):** Mencatat kuantitas barang masuk, modal beli, serta pembaruan harga master otomatis.
   - **Transaksi Keluar (Penjualan / Rusak):** Memotong stok dengan proteksi mutasi minus (`STOK_TIDAK_CUKUP`).
5. **Manajemen Pesanan Pelanggan (Pre-Order / Booking):**
   - Mencatat pesanan pelanggan dengan penentuan status otomatis (*Siap Diambil* jika stok cukup, atau *Menunggu Stok* jika belum cukup).
   - Aksi penyelesaian pesanan (otomatis mengurangi stok fisik) dan pembatalan pesanan.
6. **Laporan & Riwayat Transaksi Kronologis:**
   - Log seluruh mutasi barang masuk dan keluar dengan rincian waktu, harga, kuantitas, dan total nominal rupiah untuk kebutuhan *stock opname*.

---

## 🛠 Arsitektur & Teknologi

Struktur proyek menggunakan **Monorepo (npm workspaces)**:

```text
RPL_Stock_warung/
├── apps/
│   ├── api/                  # Backend Node.js + Express (Port 3000)
│   │   ├── middleware/       # Auth & Multi-Tenant Middleware
│   │   ├── routes/           # REST API Routes (auth, barang, transaksi, pesanan, dashboard)
│   │   ├── services/         # Business Logic Layer & Validasi
│   │   ├── server.js         # Entry Point Express Server
│   │   └── supabase.js       # Inisialisasi Supabase Client
│   └── web/                  # Frontend React 19 + Vite + Tailwind CSS (Port 5173)
│       ├── src/
│       │   ├── components/   # Komponen UI (LoginPage, Dashboard, BarangPage, dll.)
│       │   ├── utils/        # Helper (formatRupiah)
│       │   ├── App.jsx       # State & Sesi Pengguna
│       │   └── main.jsx      # Entry Point React
├── tests/                    # 8 Test Suites (58 Automated Unit Tests)
├── supabase.sql              # Skema SQL, tabel multi-tenant, & stored procedure
├── package.json              # Konfigurasi Monorepo Root
└── HowToRun.md               # Dokumentasi operasional detail
```

- **Frontend:** React 19, Vite 6, Tailwind CSS, Lucide React Icons.
- **Backend:** Node.js, Express 4, CORS, Dotenv, `@supabase/supabase-js`.
- **Database:** Supabase PostgreSQL (Stored Procedure PL/pgSQL atomik).

---

## 📥 Panduan Instalasi Fresh Clone Repo

Buka terminal di komputer Anda, lalu jalankan:

```bash
# 1. Kloning repository dari GitHub
git clone https://github.com/VonNaru/RPL_Stock_barang_warung.git

# 2. Masuk ke direktori proyek
cd RPL_Stock_barang_warung

# 3. Pasang seluruh dependensi workspace (root, backend, dan frontend)
npm install
```

---

## 🗄 Konfigurasi Basis Data Supabase

1. Buat proyek baru di [Supabase](https://supabase.com/dashboard).
2. Buka menu **SQL Editor** pada dashboard Supabase.
3. Buka file [`supabase.sql`](supabase.sql) pada repositori ini, salin seluruh isinya, tempelkan ke SQL Editor Supabase, lalu klik **Run**.
4. Skrip tersebut akan otomatis:
   - Mengaktifkan ekstensi `pgcrypto`.
   - Membuat tabel `public.tabel_pengguna` (autentikasi pengguna).
   - Membuat tabel `public.tabel_barang` dengan kolom `id_pengguna`.
   - Membuat tabel `public.tabel_transaksi` dengan kolom `id_pengguna`.
   - Membuat tabel `public.tabel_pesanan` dengan kolom `id_pengguna`.
   - Membuat fungsi stored procedure `public.catat_transaksi_stok(...)`.
   - Mengisi data demo bawaan untuk akun `admin` dan `kasir`.

---

## 🔐 Konfigurasi Environment Variable (.env)

### 1. Backend (`apps/api/.env`)
Salin file template `.env.example`:
```bash
# Windows PowerShell
Copy-Item apps/api/.env.example apps/api/.env

# Linux / macOS / Bash
cp apps/api/.env.example apps/api/.env
```

Buka `apps/api/.env` dan isi kredensial dari Supabase (**Project Settings > API**):
```env
PORT=3000
SUPABASE_URL=https://id-project-anda.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh......service-role-key-anda......
```

> ⚠️ **Catatan Keamanan:** Gunakan `service_role key` untuk backend agar dapat menjalankan stored procedure. Jangan pernah membagikan atau meng-*commit* file `.env` ke Git!

### 2. Frontend (Opsional - `apps/web/.env`)
Secara *default*, frontend memanggil API di `http://localhost:3000/api`. Jika backend berjalan di alamat/port berbeda (misal saat deploy):
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 👥 Akses Akun Demo Bawaan

Aplikasi menyediakan akun bawaan dengan katalog stok yang sudah terpisah (*multi-tenant*):

| Akun | Username | Password | Peran | Katalog Awal Bawaan |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Administrator | Beras Maknyuss 5kg, Minyak Bimoli 2L, Gula Gulaku 1kg |
| **Kasir** | `kasir` | `kasir123` | Kasir | Indomie Goreng Dus, Kopi Kapal Api Dus, Teh Sariwangi |

> 💡 **Buat Akun Mandiri:** Anda juga dapat mengklik tab **"Daftar Akun Baru"** pada halaman login untuk membuat toko baru Anda sendiri.

---

## 🚀 Menjalankan Aplikasi di Lingkungan Lokal

### Opsi A: Menjalankan Sekaligus (Rekomendasi)
```bash
npm run dev
```
- **Backend API:** Berjalan di `http://localhost:3000`
- **Frontend Web:** Berjalan di `http://localhost:5173`

Buka browser dan akses: 👉 **[http://localhost:5173](http://localhost:5173)**

### Opsi B: Menjalankan Secara Terpisah
```bash
# Terminal 1: Backend
npm run dev --workspace apps/api

# Terminal 2: Frontend
npm run dev --workspace apps/web
```

---

## 🧪 Menjalankan Automated Tests

Seluruh logika bisnis inventaris, proteksi mutasi stok, kalkulasi omzet, autentikasi scrypt, dan isolasi multi-tenant diuji secara otomatis:

```bash
npm test
```

### Hasil Test Suite (58 Pengujian Lulus):
1. `tests/1_master_barang.test.js` — Validasi katalog master barang & normalisasi input.
2. `tests/2_low_stock_dashboard.test.js` — Peringatan stok kritis & kalkulasi ringkasan.
3. `tests/3_transaksi_masuk.test.js` — Penambahan stok masuk (restok/kulakan).
4. `tests/4_transaksi_keluar.test.js` — Pengurangan stok (penjualan) & proteksi stok minus.
5. `tests/5_pesanan_pelanggan.test.js` — Otomasi status pre-order, penyelesaian, & pembatalan.
6. `tests/6_harga_omzet.test.js` — Kalkulasi modal kulakan, omzet penjualan, & laba kotor.
7. `tests/7_auth_login.test.js` — Hashing password `scrypt`, verifikasi login, & registrasi.
8. `tests/8_multi_tenant_isolation.test.js` — Middleware autentikasi & pemisahan stok antar akun.

---

## 📦 Kompilasi Build & Panduan Deploy ke Produksi

### 1. Kompilasi Build Frontend
```bash
npm run build
```
Hasil build teroptimasi berupa HTML, CSS, dan JS minified akan dibuat di folder `apps/web/dist/`.

### 2. Panduan Deploy Backend (Railway / Render / VPS)
1. Hubungkan repository GitHub ke layanan hosting (misal: [Railway](https://railway.app) atau [Render](https://render.com)).
2. Tentukan *Root Directory*: `apps/api`.
3. Tentukan *Build Command*: `npm install`.
4. Tentukan *Start Command*: `node server.js`.
5. Masukkan Environment Variables di dashboard hosting:
   - `PORT=3000`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`

### 3. Panduan Deploy Frontend (Vercel / Netlify / Cloudflare Pages)
1. Hubungkan repository ke [Vercel](https://vercel.com) atau [Netlify](https://netlify.com).
2. Tentukan *Root Directory*: `apps/web`.
3. Tentukan *Build Command*: `npm run build` (atau `vite build`).
4. Tentukan *Output Directory*: `dist`.
5. Masukkan Environment Variable:
   - `VITE_API_URL=https://api-warung-anda.up.railway.app/api` (arahkan ke URL backend produksi Anda).

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Keterangan | Header Wajib |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Pemeriksaan kesehatan server | - |
| `POST` | `/api/auth/login` | Autentikasi username & password | - |
| `POST` | `/api/auth/register` | Mendaftarkan akun toko/pengguna baru | - |
| `POST` | `/api/auth/logout` | Keluar dari sistem | - |
| `GET` | `/api/dashboard-stats` | Ringkasan finansial & statistik stok | `Authorization` / `x-user-id` |
| `GET` | `/api/barang` | Mengambil seluruh katalog barang milik akun | `Authorization` / `x-user-id` |
| `GET` | `/api/barang/low-stock` | Mengambil daftar barang yang stoknya menipis | `Authorization` / `x-user-id` |
| `POST` | `/api/barang` | Menambah barang baru ke katalog akun | `Authorization` / `x-user-id` |
| `PUT` | `/api/barang/:id` | Mengubah informasi barang milik akun | `Authorization` / `x-user-id` |
| `GET` | `/api/transaksi` | Riwayat transaksi keluar-masuk akun | `Authorization` / `x-user-id` |
| `POST` | `/api/transaksi` | Mencatat transaksi masuk/keluar | `Authorization` / `x-user-id` |
| `GET` | `/api/pesanan` | Mengambil daftar pesanan pelanggan | `Authorization` / `x-user-id` |
| `GET` | `/api/pesanan/menunggu-stok` | Mengambil pesanan yang tertunda stok | `Authorization` / `x-user-id` |
| `POST` | `/api/pesanan` | Membuat pesanan pelanggan baru | `Authorization` / `x-user-id` |
| `POST` | `/api/pesanan/:id/selesaikan` | Menyelesaikan pesanan & potong stok | `Authorization` / `x-user-id` |
| `POST` | `/api/pesanan/:id/batalkan` | Membatalkan pesanan | `Authorization` / `x-user-id` |

---

## 🤝 Panduan Pull Request & Kontribusi

Sebelum mengajukan *Pull Request* (PR) ke branch `main`:
1. Buat branch baru dari `main`:
   ```bash
   git checkout -b feature/nama-fitur
   ```
2. Pastikan seluruh 58 unit test lulus tanpa error:
   ```bash
   npm test
   ```
3. Pastikan build frontend berhasil dikompilasi:
   ```bash
   npm run build
   ```
4. Pastikan tidak ada file rahasia (`.env`) yang terbawa pada `git status`.
5. Buka Pull Request di GitHub dan sertakan deskripsi perubahan yang jelas.
