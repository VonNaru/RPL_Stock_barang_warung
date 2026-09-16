1. Latar Belakang Masalah
Operasional warung kelontong umumnya masih sangat bergantung pada sistem pencatatan manual di buku atau bahkan sekadar ingatan pemiliknya. Seiring dengan bertambahnya variasi barang dan tingginya intensitas transaksi harian, pengelolaan stok secara konvensional ini memunculkan beberapa masalah operasional:

Kehabisan Stok yang Tidak Terpantau (Stockout): Sering kali pemilik warung baru menyadari suatu barang habis tepat ketika pelanggan menanyakannya. Hal ini mengakibatkan hilangnya potensi pendapatan dan menurunkan tingkat kepercayaan pelanggan terhadap kelengkapan warung.

Inefisiensi Proses Pengadaan (Kulakan): Tanpa adanya data ketersediaan barang yang pasti, proses belanja ke agen menjadi tidak terarah. Pemilik kesulitan menentukan barang mana yang harus diprioritaskan, yang sering berujung pada kelebihan stok barang yang kurang laku atau kekurangan stok barang yang cepat berputar.

Risiko Selisih Barang dan Kehilangan: Pencatatan manual sangat rentan terhadap human error, tercecer, atau rusak. Akibatnya, sangat sulit untuk melakukan audit atau melacak apakah barang berkurang karena terjual, rusak, atau hilang.

Ketiadaan Rekam Jejak Data: Tidak adanya histori pergerakan barang membuat pemilik kesulitan mengevaluasi tren warungnya secara objektif.

2. Deskripsi Proyek
"Sistem Informasi Manajemen Stok Warung" adalah sebuah aplikasi berbasis web yang dirancang khusus untuk mendigitalisasi proses inventaris pada warung kelontong. Sistem ini memfasilitasi pencatatan arus masuk dan keluarnya barang secara real-time ke dalam database relasional yang terpusat.

Fokus utama dari proyek ini adalah memberikan visibilitas penuh kepada owner terkait status ketersediaan barang dagangannya. Dengan mengotomatisasi pemantauan stok, sistem secara proaktif menginformasikan barang-barang yang sudah menyentuh batas minimum (threshold). Hal ini memungkinkan pemilik untuk segera melakukan pengadaan barang sebelum stok benar-benar kosong di rak. Aplikasi ini dirancang dengan antarmuka yang lugas dan fungsional agar proses pendataan bisa dilakukan dengan cepat.

3. Fitur-Fitur Utama
Berikut adalah rincian fungsionalitas yang akan dibangun di dalam web:

Dashboard & Low-Stock Alerts (Peringatan Stok Menipis):
Halaman beranda yang memberikan ringkasan visual data inventaris. Fitur utamanya adalah widget atau tabel indikator yang secara otomatis memunculkan daftar barang yang stoknya berada di bawah ambang batas aman.

Manajemen Master Barang (Katalog):
Modul sentral untuk mengelola daftar barang. Pengguna dapat menambah item baru, mengubah nama, kategori, serta mengatur angka mutlak untuk "stok minimum" dari tiap-tiap barang sebagai pemicu notifikasi dashboard.

Modul Transaksi In/Out (Barang Masuk & Keluar):
Fasilitas input untuk mencatat penambahan stok (saat restok dari agen) dan pengurangan stok (saat barang laku, kedaluwarsa, atau cacat). Setiap eksekusi transaksi akan langsung memicu perhitungan otomatis (update) pada total stok saat ini.

Laporan Riwayat Transaksi:
Tabel log yang merekam seluruh jejak aktivitas keluar-masuknya barang secara kronologis, lengkap dengan keterangan waktu. Fitur ini esensial untuk keperluan pencocokan data (stock opname) antara sistem dengan fisik barang.