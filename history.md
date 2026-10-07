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

## Catatan Pembaruan Berikutnya

Gunakan bagian ini untuk menambahkan perubahan baru. Format yang disarankan:

```md
## YYYY-MM-DD

### Nama Pembaruan

- Perubahan yang dibuat.
- File atau modul yang terkena dampak.
- Hasil pengujian.
