# History Perubahan

Catatan ini berisi pembaruan penting pada aplikasi Sistem Informasi Manajemen Stok Warung.

## 2026-09-30

### Refactor Struktur Frontend

- Memisahkan komponen frontend dari `App.jsx` agar lebih mudah dirawat.
- `App.jsx` sekarang fokus pada state aplikasi, pemanggilan API, navigasi, dan pengaturan modal.
- Membuat komponen `Dashboard.jsx` untuk halaman ringkasan.
- Membuat komponen `BarangPage.jsx` untuk master barang.
- Membuat komponen `TransactionPage.jsx` untuk transaksi masuk dan keluar.
- Membuat komponen `History.jsx` untuk riwayat transaksi.
- Membuat komponen `BarangModal.jsx` untuk form tambah dan edit barang.
- Membuat komponen `StatCard.jsx` untuk kartu statistik dashboard.
- Menjaga fitur dan tampilan yang sudah ada agar tetap berjalan.
- Menjalankan `npm run build` dan build berhasil.

### Fitur yang Sudah Tersedia

- Dashboard stok warung.
- Peringatan stok minimum.
- Tambah dan edit barang.
- Transaksi stok masuk.
- Transaksi stok keluar.
- Validasi stok keluar melalui backend.
- Riwayat transaksi.
- Navigasi sidebar desktop dan mobile.
- Notifikasi berhasil atau gagal.
- Tombol segarkan data.

## 2026-10-07

### Fitur Manajemen Pesanan (Pre-Order / Booking)

- **Database (`supabase.sql`)**:
  - Membuat tabel `tabel_pesanan` untuk menyimpan pesanan dari pelanggan (`nama_pelanggan`, `id_barang`, `jumlah_pesanan`, `status_pesanan`, `catatan`, `created_at`, `updated_at`).
  - Menambahkan index `idx_tabel_pesanan_status_pesanan` dan `idx_tabel_pesanan_id_barang` untuk optimasi query.
- **Backend API (`apps/api`)**:
  - Membuat route baru `apps/api/routes/pesanan.js` dan mendaftarkannya di `server.js` (`/api/pesanan`).
  - Menambahkan endpoint `GET /api/pesanan` (semua pesanan) dan `GET /api/pesanan/menunggu-stok` (pesanan pending).
  - Menambahkan endpoint `POST /api/pesanan` untuk mencatat pesanan baru dengan penentuan status otomatis ('Siap Diambil' jika stok mencukupi, atau 'Menunggu Stok' jika tidak mencukupi).
  - Menambahkan endpoint `POST /api/pesanan/:Id/selesaikan` untuk menyelesaikan pesanan dan secara otomatis memotong stok barang melalui stored procedure `catat_transaksi_stok`.
  - Menambahkan endpoint `POST /api/pesanan/:Id/batalkan` untuk membatalkan pesanan.
- **Frontend (`apps/web`)**:
  - Membuat komponen GUI `PesananPage.jsx` untuk pencatatan, pemantauan status, penyelesaian, dan pembatalan pesanan.
  - Memperbarui `App.jsx` dengan menambahkan menu "Pesanan" pada sidebar navigasi.
- **Pengujian**:
  - Menjalankan `npm run build` dan berhasil dikompilasi tanpa error.

---

## 2026-10-15

### Penyempurnaan MVP & Arsitektur Service Layer

- **Penyempurnaan Service Layer Backend (`apps/api/services`)**:
  - `barangService.js`: Modul aturan bisnis untuk validasi input master barang, penentuan status stok ('Aman' vs 'Stok rendah'), filter barang kritis (low-stock), dan kalkulasi ringkasan dashboard.
  - `transaksiService.js`: Modul aturan bisnis untuk validasi transaksi masuk dan keluar, serta kalkulasi mutasi stok dengan proteksi error `STOK_TIDAK_CUKUP`.
  - `pesananService.js`: Modul aturan bisnis untuk validasi pesanan, penentuan status awal ('Siap Diambil' vs 'Menunggu Stok'), serta aturan kelayakan penyelesaian dan pembatalan pesanan.
- **Refaktor Controller API (`apps/api/routes`)**:
  - `barang.js`, `transaksi.js`, dan `pesanan.js` mengadopsi modul service untuk memastikan konsistensi aturan bisnis dan modularitas kode produksi.
- **Pengujian**:
  - Seluruh file service dan route lulus syntax check `node --check`.
  - Frontend berhasil di-build tanpa error (`npm run build`).

---

## 2026-10-20

### Fitur Pencatatan Harga Beli (Modal Kulakan), Harga Jual (Omzet), dan Dashboard Finansial

- **Database (`supabase.sql`)**:
  - Menambahkan kolom `harga_beli` (NUMERIC, default 0, check >= 0) dan `harga_jual` (NUMERIC, default 0, check >= 0) pada `tabel_barang`.
  - Menambahkan kolom `harga_beli` (NUMERIC, default 0, check >= 0) dan `harga_jual` (NUMERIC, default 0, check >= 0) pada `tabel_transaksi`.
  - Menyediakan skrip migrasi `ALTER TABLE ADD COLUMN IF NOT EXISTS` agar aman dieksekusi pada database yang sudah berjalan.
  - Memperbarui stored procedure PostgreSQL `catat_transaksi_stok(p_id_barang, p_jenis_transaksi, p_jumlah, p_harga_beli, p_harga_jual)`:
    - Menyimpan harga kulakan masuk ke `tabel_transaksi` dan memperbarui harga master jika ada input harga baru (> 0).
    - Mengambil otomatis harga jual master untuk transaksi keluar jika tidak diisi secara spesifik dan menyimpannya ke `tabel_transaksi`.
    - Menjaga keandalan proteksi stok tidak minus (`STOK_TIDAK_CUKUP`).
- **Backend API (`apps/api`)**:
  - `barangService.js`:
    - Menambahkan validasi `harga_beli` dan `harga_jual` (wajib angka non-negatif).
    - Memperbarui fungsi `calculateDashboardSummary` untuk menghitung 4 metrik: Total Kuantitas Masuk, Total Kuantitas Keluar, Total Pengeluaran Kulakan (`sum(jumlah * harga_beli)` dari transaksi masuk), dan Total Omzet Penjualan (`sum(jumlah * harga_jual)` dari transaksi keluar).
  - `transaksiService.js`:
    - Menambahkan validasi input harga transaksi pada `validateTransaksiInput`.
  - `routes/barang.js`:
    - `POST /api/barang` dan `PUT /api/barang/:id` memproses dan menyimpan `harga_beli` serta `harga_jual`.
  - `routes/transaksi.js`:
    - `POST /api/transaksi` mendukung input harga beli dan jual dengan fallback resilien terhadap signature RPC database.
  - `routes/dashboard.js` & `server.js`:
    - Menyediakan endpoint baru `GET /api/dashboard-stats` yang mengembalikan perhitungan finansial dan arus barang.
- **Frontend UI (`apps/web`)**:
  - `src/utils/format.js`:
    - Membuat helper `formatRupiah` menggunakan `Intl.NumberFormat('id-ID')`.
  - `src/components/BarangModal.jsx`:
    - Menambahkan input "Harga Beli / Dus" dan "Harga Jual / Dus" pada modal tambah/edit barang.
  - `src/components/BarangPage.jsx`:
    - Menambahkan kolom "Harga Beli" dan "Harga Jual" berformat Rupiah pada tabel katalog barang.
  - `src/components/TransactionPage.jsx`:
    - Transaksi Masuk: Menampilkan input opsional "Harga Beli Baru / Dus" dan "Harga Jual Baru / Dus" untuk memperbarui master barang.
    - Transaksi Keluar: Menampilkan input "Harga Jual / Dus" yang otomatis terisi dari harga master barang dengan fleksibilitas perubahan manual.
  - `src/components/Dashboard.jsx`:
    - Menampilkan 4 kartu statistik baru (StatCard): Total Item Masuk, Total Item Keluar, Total Pengeluaran Kulakan (Rp), dan Total Omzet Penjualan (Rp).
  - `src/components/History.jsx`:
    - Menambahkan kolom "Harga Beli", "Harga Jual", dan "Total Nilai" transaksi dalam format Rupiah.
  - `src/App.jsx`:
    - Memuat data dari `/dashboard-stats`, menyediakan fallback kalkulasi realtime jika offline, dan mengelola payload harga pada transaksi.
- **Pengujian**:
  - Menambahkan test suite baru `tests/6_harga_omzet.test.js` dengan 5 skenario pengujian.
  - Seluruh 39 unit test pada 6 test suite lulus (`npm test`).
  - Frontend React berhasil dikompilasi tanpa error (`npm run build`).

---

## Catatan Pembaruan Berikutnya

Gunakan bagian ini untuk menambahkan perubahan baru. Format yang disarankan:

```md
## YYYY-MM-DD

### Nama Pembaruan

- Perubahan yang dibuat.
- File atau modul yang terkena dampak.
- Hasil pengujian.
```
