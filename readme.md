<h1 align="center">Sistem Informasi Manajemen Stok Warung</h1>

> Aplikasi berbasis web yang dirancang khusus untuk mendigitalisasi proses inventaris pada warung kelontong. Sistem ini memfasilitasi pencatatan arus masuk dan keluarnya barang secara real-time dan memberikan peringatan dini saat stok menipis.

---

### 📌 Latar Belakang Masalah

Operasional warung kelontong umumnya masih sangat bergantung pada sistem pencatatan manual di buku atau bahkan sekadar ingatan pemiliknya. Seiring dengan bertambahnya variasi barang dan tingginya intensitas transaksi harian, pengelolaan stok secara konvensional ini memunculkan beberapa masalah operasional:

- **Kehabisan Stok yang Tidak Terpantau (Stockout):** Sering kali pemilik warung baru menyadari suatu barang habis tepat ketika pelanggan menanyakannya. Hal ini mengakibatkan hilangnya potensi pendapatan dan menurunkan tingkat kepercayaan pelanggan terhadap kelengkapan warung.
- **Inefisiensi Proses Pengadaan (Kulakan):** Tanpa adanya data ketersediaan barang yang pasti, proses belanja ke agen menjadi tidak terarah. Pemilik kesulitan menentukan barang mana yang harus diprioritaskan.
- **Risiko Selisih Barang dan Kehilangan:** Pencatatan manual sangat rentan terhadap *human error*, tercecer, atau rusak. Akibatnya, sangat sulit untuk melakukan audit atau melacak apakah barang berkurang karena terjual, rusak, atau hilang.
- **Ketiadaan Rekam Jejak Data:** Tidak adanya histori pergerakan barang membuat pemilik kesulitan mengevaluasi tren warungnya secara objektif.

### 📖 Deskripsi Proyek

**Sistem Informasi Manajemen Stok Warung** adalah sebuah aplikasi berbasis web yang dirancang khusus untuk mendigitalisasi proses inventaris pada warung kelontong. Sistem ini memfasilitasi pencatatan arus masuk dan keluarnya barang secara *real-time* ke dalam *database* relasional yang terpusat. 

Fokus utama dari proyek ini adalah memberikan visibilitas penuh kepada *owner* terkait status ketersediaan barang dagangannya. Dengan mengotomatisasi pemantauan stok, sistem secara proaktif menginformasikan barang-barang yang sudah menyentuh batas minimum (*threshold*). Hal ini memungkinkan pemilik untuk segera melakukan pengadaan barang sebelum stok benar-benar kosong di rak. Aplikasi ini dirancang dengan antarmuka yang lugas dan fungsional agar proses pendataan bisa dilakukan dengan cepat.

### 🎯 Lingkup Fitur Sistem

- **Dashboard & Low-Stock Alerts:** Halaman beranda yang memberikan ringkasan visual data inventaris. Dilengkapi *widget* indikator yang secara otomatis memunculkan daftar barang yang stoknya berada di bawah ambang batas aman.
- **Manajemen Master Barang (Katalog):** Modul sentral untuk mengelola daftar barang. Pengguna dapat menambah item baru, mengubah nama, kategori, serta mengatur angka mutlak untuk "stok minimum" dari tiap-tiap barang.
- **Modul Transaksi In/Out:** Fasilitas input untuk mencatat penambahan stok (saat restok dari agen) dan pengurangan stok (saat barang laku, kedaluwarsa, atau cacat) yang otomatis meng-*update* total stok.
- **Manajemen Pesanan Pelanggan:** Fasilitas untuk mencatat pesanan berdasarkan nama pelanggan, barang, jumlah, dan catatan. Sistem menentukan status awal pesanan berdasarkan ketersediaan stok, serta menyediakan aksi untuk menyelesaikan atau membatalkan pesanan.
- **Laporan Riwayat Transaksi:** Tabel log yang merekam seluruh jejak aktivitas keluar-masuknya barang secara kronologis beserta keterangan waktu untuk keperluan pencocokan data (*stock opname*).

## Cara Menjalankan Aplikasi

Ikuti urutan ini dari folder `D:\RPL_Stock_warung`. Jangan langsung menjalankan `npm run dev` sebelum membuat file environment Supabase.

### Langkah 1: Install dependency

Pastikan Node.js 18 atau lebih baru sudah terpasang, kemudian jalankan:

```powershell
npm install
```

Perintah ini memasang dependency backend dan frontend dari workspace sekaligus.

### Langkah 2: Siapkan Supabase

1. Buat project di https://supabase.com.
2. Buka menu **SQL Editor**.
3. Salin seluruh isi file `supabase.sql` ke SQL Editor dan klik **Run**.
4. Buka **Project Settings > API** dan siapkan `Project URL` serta `service_role key`.

### Langkah 3: Buat file `.env` backend

Di PowerShell, jalankan:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Buka `apps/api/.env`, lalu isi nilainya:

```env
PORT=3000
SUPABASE_URL=https://kode-project-anda.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key-anda
```

Jangan membagikan `SUPABASE_SERVICE_ROLE_KEY` dan jangan mengunggah `apps/api/.env` ke GitHub. File tersebut sudah dilindungi oleh `.gitignore`.

### Langkah 4: Jalankan aplikasi

Jalankan frontend dan backend sekaligus dari folder root:

```powershell
npm run dev
```

Buka alamat frontend yang tampil di terminal, biasanya http://localhost:5173. Backend berjalan di http://localhost:3000.

Jika sebelumnya muncul error `supabaseUrl is required`, artinya langkah 3 belum dilakukan atau URL di `.env` masih kosong. Setelah mengubah `.env`, hentikan server dengan `Ctrl+C`, lalu jalankan lagi `npm run dev`.

### Menjalankan secara terpisah

```powershell
npm run dev --workspace apps/api
npm run dev --workspace apps/web
```

## Implementasi Aplikasi

Aplikasi tersedia dalam struktur monorepo berikut. Struktur ini memakai folder `apps` yang sudah ada di repository sebagai padanan dari `client` dan `server`:

```text
RPL_Stock_warung/
	apps/
		api/       # Backend Node.js + Express
		web/       # Frontend React + Vite + Tailwind CSS
	supabase.sql
	package.json
```

### 1. Prasyarat dan instalasi

Gunakan Node.js 18 atau lebih baru, lalu jalankan dari folder root:

```bash
npm install
```

Perintah tersebut menjalankan `npm init` secara konseptual melalui `package.json` root dan memasang dependency workspace. Jika membuat proyek dari nol, urutan manualnya adalah:

```bash
npm init -y
cd apps/api && npm install express cors dotenv @supabase/supabase-js
cd ../web && npm install react react-dom lucide-react
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

### 2. Supabase

1. Buat project baru di Supabase.
2. Buka **SQL Editor**, salin seluruh isi `supabase.sql`, lalu jalankan query.
3. Salin `apps/api/.env.example` menjadi `apps/api/.env`.
4. Isi `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` dari menu **Project Settings > API**. Service role key hanya digunakan backend dan jangan dimasukkan ke frontend.

Query membuat tabel `tabel_barang`, `tabel_transaksi`, dan `tabel_pesanan`, constraint foreign key, serta function `catat_transaksi_stok`. Function tersebut mengunci update stok secara aman dan menolak transaksi keluar jika stok tidak mencukupi. Tabel pesanan menyimpan status `Menunggu Stok`, `Siap Diambil`, `Selesai`, atau `Dibatalkan`.

### 3. Menjalankan aplikasi

Jalankan frontend dan backend sekaligus dari root:

```bash
npm run dev
```

Atau jalankan terpisah:

```bash
npm run dev --workspace apps/api    # http://localhost:3000
npm run dev --workspace apps/web   # alamat Vite, biasanya http://localhost:5173
```

Jika API berjalan di alamat selain default, buat `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Endpoint API

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| GET | `/api/barang` | Mengambil seluruh barang |
| GET | `/api/barang/low-stock` | Mengambil barang dengan stok di bawah minimum |
| POST | `/api/barang` | Menambah barang |
| PUT | `/api/barang/:id` | Mengubah barang dan batas minimum |
| GET | `/api/transaksi` | Mengambil riwayat transaksi |
| POST | `/api/transaksi` | Mencatat transaksi `masuk` atau `keluar` |
| GET | `/api/pesanan` | Mengambil seluruh pesanan |
| GET | `/api/pesanan/menunggu-stok` | Mengambil pesanan yang masih menunggu stok |
| POST | `/api/pesanan` | Mencatat pesanan pelanggan |
| POST | `/api/pesanan/:id/selesaikan` | Menyelesaikan pesanan dan mengurangi stok |
| POST | `/api/pesanan/:id/batalkan` | Membatalkan pesanan |

Contoh body untuk transaksi:

```json
{
	"id_barang": "uuid-barang",
	"jenis_transaksi": "keluar",
	"jumlah": 2
}
```

### 5. Fitur frontend

- **Ringkasan:** widget peringatan stok rendah dari `/api/barang/low-stock` dan statistik inventaris.
- **Master Barang:** tabel barang serta modal tambah/edit nama, stok, dan stok minimum.
- **Transaksi In / Out:** dropdown barang, jenis transaksi, dan jumlah.
- **Pesanan:** mencatat pesanan pelanggan, melihat status ketersediaan pesanan, menyelesaikan pesanan ketika stok tersedia, dan membatalkan pesanan.
- **Riwayat Transaksi:** daftar transaksi dari yang terbaru dengan nama barang, jenis, jumlah, dan waktu.

### Perintah pemeriksaan

```bash
node --check apps/api/server.js
npm run build --workspace apps/web
```