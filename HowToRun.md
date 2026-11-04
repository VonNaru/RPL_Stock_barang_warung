# Petunjuk Menjalankan Aplikasi
## Sistem Informasi Manajemen Stok Warung

vidio cara menjalankan: https://drive.google.com/drive/folders/1geBZfxnuWprEdy2GoWWgSTxyXNQFqWFY?usp=sharing

Dokumen ini berisi panduan lengkap langkah demi langkah untuk menginstalasi, mengonfigurasi basis data, dan menjalankan aplikasi **Sistem Informasi Manajemen Stok Warung** pada lingkungan lokal (*local development*).

---

## 📋 Daftar Isi
1. [Prasyarat Sistem](#1-prasyarat-sistem)
2. [Struktur Proyek](#2-struktur-proyek)
3. [Instalasi Dependensi](#3-instalasi-dependensi)
4. [Konfigurasi Database Supabase](#4-konfigurasi-database-supabase)
5. [Konfigurasi Environment Variable (.env)](#5-konfigurasi-environment-variable-env)
6. [Menjalankan Aplikasi](#6-menjalankan-aplikasi)
7. [Menjalankan Automated Tests](#7-menjalankan-automated-tests)
8. [Build untuk Produksi](#8-build-untuk-produksi)
9. [Daftar Endpoint API Utama](#9-daftar-endpoint-api-utama)
10. [Troubleshooting & Masalah Umum](#10-troubleshooting--masalah-umum)

---

## 1. Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.x` atau lebih baru (disarankan versi LTS terbaru).  
  *Cek versi:* `node -v`
- **npm**: Versi `9.x` atau lebih baru.  
  *Cek versi:* `npm -v`
- **Koneksi Internet**: Untuk mengunduh *package* npm dan mengakses database cloud Supabase.
- **Akun Supabase**: Akun gratis di [supabase.com](https://supabase.com).

---

## 2. Struktur Proyek

Aplikasi ini menggunakan arsitektur monorepo dengan **npm workspaces**:

```text
RPL_Stock_warung/
├── apps/
│   ├── api/                  # Backend: Node.js, Express, Supabase Client (Port 3000)
│   │   ├── routes/           # Routing API (barang, transaksi, pesanan, dashboard)
│   │   ├── services/         # Business logic layer & validasi data
│   │   ├── .env.example      # Template konfigurasi environment backend
│   │   ├── server.js         # Entry point server Express
│   │   └── supabase.js       # Inisialisasi koneksi Supabase
│   └── web/                  # Frontend: React 19, Vite, Tailwind CSS (Port 5173)
│       ├── src/
│       │   ├── components/   # Komponen UI (Dashboard, BarangPage, PesananPage, dll.)
│       │   ├── utils/        # Helper (formatRupiah, dsb.)
│       │   ├── App.jsx       # State management & navigasi utama
│       │   └── main.jsx      # Entry point React
│       └── vite.config.js    # Konfigurasi bundler Vite
├── tests/                    # Unit testing suite (User Story 1 - 7)
├── supabase.sql              # Skrip skema database, tabel, indeks, & stored procedure
├── package.json              # Konfigurasi workspace monorepo & script utama
└── HowToRun.md               # Panduan menjalankan aplikasi (file ini)
```

---

## 3. Instalasi Dependensi

Buka terminal (PowerShell, Command Prompt, atau Git Bash) di direktori *root* proyek (`d:\RPL_Stock_warung`), lalu jalankan:

```bash
npm install
```

> **Catatan:** Perintah ini secara otomatis akan memasang seluruh dependensi untuk proyek root, backend (`apps/api`), dan frontend (`apps/web`) sekaligus melalui fitur npm workspaces.

---

## 4. Konfigurasi Database Supabase

Aplikasi membutuhkan database PostgreSQL yang di-host di Supabase. Ikuti langkah berikut:

1. Buka dan login ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat proyek baru (*New Project*) jika belum memiliki proyek. Tentukan nama proyek, *database password*, dan pilih region terdekat (misal: *Singapore*).
3. Setelah database siap, buka menu **SQL Editor** di sidebar kiri Supabase.
4. Buka file [`supabase.sql`](supabase.sql) pada direktori *root* proyek ini, salin seluruh isinya, dan tempelkan ke editor SQL Supabase.
5. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
6. Skrip ini akan membuat komponen database:
   - **`public.tabel_barang`**: Menyimpan katalog produk, stok saat ini, stok minimum, harga beli, harga jual, dan relasi kepemilikan `id_pengguna`.
   - **`public.tabel_transaksi`**: Mencatat histori barang masuk (kulakan) dan barang keluar (penjualan) terisolasi per akun (`id_pengguna`).
   - **`public.tabel_pesanan`**: Mencatat pesanan pelanggan (*pre-order / booking*) terisolasi per akun (`id_pengguna`).
   - **`public.tabel_pengguna`**: Menyimpan data akun pengguna/login (username, hashed password, nama lengkap, dan role: `admin`, `kasir`, `pemilik`).
   - **Stored Procedure `catat_transaksi_stok`**: Fungsi mutasi stok atomik dengan proteksi stok tidak minus (`STOK_TIDAK_CUKUP`) dan pencatatan kepemilikan pengguna.

> 💡 **Akun Login Bawaan & Stok Terpisah (Multi-Tenant Demo):**
> - **Akun Admin**: Username: `admin` | Password: `admin123` (Katalog: Beras Maknyuss, Minyak Bimoli, Gula Pasir).
> - **Akun Kasir**: Username: `kasir` | Password: `kasir123` (Katalog: Indomie Goreng, Kopi Kapal Api, Teh Celup).
> - **Daftar Akun Baru**: Anda juga dapat membuat akun toko baru secara mandiri langsung dari halaman web melalui tab **"Daftar Akun Baru"** pada form login.
> - *Setiap akun memiliki stok barang, mutasi transaksi, pesanan, dan ringkasan finansial yang terpisah total.*

---

## 5. Konfigurasi Environment Variable (.env)

### A. Mendapatkan Kredensial Supabase
1. Di dashboard Supabase, buka menu **Project Settings** (ikon gerigi di kiri bawah).
2. Pilih submenu **API**.
3. Salin dua nilai berikut:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **`service_role` secret key** (bukan `anon` key, karena backend membutuhkan hak akses service role untuk menjalankan stored procedure dan mutasi stok).

### B. Membuat File `.env` Backend
Salin template `apps/api/.env.example` menjadi `apps/api/.env`:

*Di Windows PowerShell:*
```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

*Di Command Prompt / Bash:*
```bash
cp apps/api/.env.example apps/api/.env
```

Buka file `apps/api/.env` dan sesuaikan nilainya:
```env
PORT=3000
SUPABASE_URL=https://id-project-anda.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh......service-role-key-anda......
```

> ⚠️ **PENTING:** Jangan pernah mengunggah file `.env` atau membagikan `SUPABASE_SERVICE_ROLE_KEY` ke repository publik. File `.env` sudah masuk ke dalam `.gitignore`.

### C. (Opsional) Konfigurasi Frontend
Secara default, frontend React akan otomatis menghubungi API di `http://localhost:3000/api`. Jika backend Anda berjalan di port atau host berbeda, buat file `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 6. Menjalankan Aplikasi

Pastikan Anda berada di direktori *root* (`RPL_Stock_warung`).

### Cara 1: Menjalankan Sekaligus (Rekomendasi)
Jalankan frontend dan backend secara bersamaan dalam satu terminal:

```bash
npm run dev
```

Perintah di atas memanfaatkan `concurrently` untuk menyalakan:
- **Backend API**: `http://localhost:3000`
- **Frontend Web**: `http://localhost:5173` (atau port lain yang dialokasikan oleh Vite)

Buka peramban (browser) dan akses alamat frontend:
👉 **[http://localhost:5173](http://localhost:5173)**

---

### Cara 2: Menjalankan Secara Terpisah (Dua Terminal)
Jika ingin memantau log backend dan frontend pada terminal yang terpisah:

**Terminal 1 — Backend API:**
```bash
npm run dev --workspace apps/api
```
*(Server backend akan aktif di http://localhost:3000)*

**Terminal 2 — Frontend Web:**
```bash
npm run dev --workspace apps/web
```
*(Vite dev server akan aktif di http://localhost:5173)*

---

## 7. Menjalankan Automated Tests

Aplikasi dilengkapi dengan test suite unit & integrasi logika bisnis mencakup seluruh User Story (58 pengujian):

```bash
npm test
```

### Cakupan Test Suite:
1. `tests/1_master_barang.test.js` — Validasi katalog master barang dan batas stok.
2. `tests/2_low_stock_dashboard.test.js` — Peringatan stok kritis (*low-stock alert*) dan ringkasan dasbor.
3. `tests/3_transaksi_masuk.test.js` — Penambahan stok masuk (kulakan) dan validasi input.
4. `tests/4_transaksi_keluar.test.js` — Pengurangan stok (penjualan) dan proteksi stok minus.
5. `tests/5_pesanan_pelanggan.test.js` — Pre-order, penentuan status otomatis, penyelesaian, dan pembatalan.
6. `tests/6_harga_omzet.test.js` — Kalkulasi harga beli, omzet penjualan, dan ringkasan finansial.
7. `tests/7_auth_login.test.js` — Autentikasi pengguna, hashing password scrypt, validasi login & registrasi.
8. `tests/8_multi_tenant_isolation.test.js` — Middleware autentikasi dan isolasi data multi-tenant antar akun.

---

## 8. Build untuk Produksi

Untuk mengompilasi kode frontend React menjadi file statis siap produksi:

```bash
npm run build
```

Hasil build berupa file HTML, CSS, dan JS yang teroptimasi akan berada di direktori `apps/web/dist/`.

Untuk menjalankan server backend dalam mode produksi:
```bash
npm run start --workspace apps/api
```

---

## 9. Daftar Endpoint API Utama

| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Status kesehatan server API |
| `POST` | `/api/auth/login` | Masuk ke sistem menggunakan username dan password |
| `POST` | `/api/auth/register` | Mendaftarkan akun pengguna baru |
| `GET` | `/api/auth/users` | Mengambil daftar pengguna aktif |
| `POST` | `/api/auth/logout` | Keluar dari sistem |
| `GET` | `/api/dashboard-stats` | Ringkasan metrik statistik finansial & arus barang |
| `GET` | `/api/barang` | Mengambil seluruh katalog barang |
| `GET` | `/api/barang/low-stock` | Mengambil barang dengan stok sama dengan/di bawah minimum |
| `POST` | `/api/barang` | Menambah barang baru (stok, minimum, harga beli, harga jual) |
| `PUT` | `/api/barang/:id` | Mengubah informasi barang dan harga |
| `GET` | `/api/transaksi` | Mengambil riwayat mutasi transaksi keluar-masuk |
| `POST` | `/api/transaksi` | Mencatat transaksi masuk (kulakan) atau keluar (penjualan) |
| `GET` | `/api/pesanan` | Mengambil seluruh data pesanan pelanggan |
| `GET` | `/api/pesanan/menunggu-stok` | Mengambil pesanan berstatus *Menunggu Stok* |
| `POST` | `/api/pesanan` | Membuat pesanan pelanggan baru |
| `POST` | `/api/pesanan/:id/selesaikan` | Menyelesaikan pesanan (memotong stok secara otomatis) |
| `POST` | `/api/pesanan/:id/batalkan` | Membatalkan pesanan |

---

## 10. Troubleshooting & Masalah Umum

### 1. Error: `supabaseUrl is required` atau `Konfigurasi Supabase belum lengkap`
- **Penyebab:** File `.env` belum dibuat atau variabel `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` masih kosong.
- **Solusi:** Pastikan Anda telah membuat `apps/api/.env` dan mengisi URL serta Service Role Key Supabase dengan benar. Restart server setelah mengubah file `.env`.

### 2. Error: `STOK_TIDAK_CUKUP` saat Transaksi Keluar
- **Penyebab:** Jumlah barang yang dimasukkan pada transaksi keluar melebihi stok yang tersedia di database.
- **Solusi:** Sistem sengaja mencegah mutasi stok menjadi negatif. Periksa sisa stok di menu Master Barang dan lakukan transaksi masuk (restok) terlebih dahulu jika persediaan habis.

### 3. Port 3000 atau Port 5173 Sudah Digunakan (*EADDRINUSE*)
- **Penyebab:** Ada aplikasi lain yang berjalan di port yang sama.
- **Solusi:**
  - Hentikan proses yang sedang memakai port tersebut, atau
  - Ubah `PORT=3001` di `apps/api/.env`, dan sesuaikan `VITE_API_URL=http://localhost:3001/api` pada `apps/web/.env`.

### 4. Perubahan Kode Frontend Tidak Muncul
- **Solusi:** Lakukan hard-refresh pada browser dengan menekan `Ctrl + F5` (Windows) atau `Cmd + Shift + R` (Mac).

