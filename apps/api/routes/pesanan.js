import { Router } from 'express';
import { supabase } from '../supabase.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('tabel_pesanan')
      .select('*, tabel_barang(nama_barang, stok_saat_ini)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.get('/menunggu-stok', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('tabel_pesanan')
      .select('*, tabel_barang(nama_barang, stok_saat_ini)')
      .eq('status_pesanan', 'Menunggu Stok')
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const namaPelanggan = req.body.NamaPelanggan || req.body.nama_pelanggan || req.body.namaPelanggan;
    const idBarang = req.body.IdBarang || req.body.id_barang || req.body.idBarang;
    const jumlahPesanan = req.body.JumlahPesanan ?? req.body.jumlah_pesanan ?? req.body.jumlahPesanan;
    const catatan = req.body.Catatan ?? req.body.catatan ?? null;

    if (!namaPelanggan?.trim() || !idBarang || !Number.isInteger(jumlahPesanan) || jumlahPesanan <= 0) {
      return res.status(400).json({ message: 'Nama pelanggan, barang, dan jumlah pesanan positif wajib diisi.' });
    }

    const { data: barang, error: barangError } = await supabase
      .from('tabel_barang')
      .select('stok_saat_ini')
      .eq('id_barang', idBarang)
      .single();

    if (barangError || !barang) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    const statusPesanan = barang.stok_saat_ini >= jumlahPesanan ? 'Siap Diambil' : 'Menunggu Stok';

    const { data, error } = await supabase
      .from('tabel_pesanan')
      .insert({
        nama_pelanggan: namaPelanggan.trim(),
        id_barang: idBarang,
        jumlah_pesanan: jumlahPesanan,
        status_pesanan: statusPesanan,
        catatan: catatan?.trim() || null
      })
      .select('*, tabel_barang(nama_barang, stok_saat_ini)')
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Pesanan berhasil dicatat.', data });
  } catch (error) { next(error); }
});

router.post('/:Id/selesaikan', async (req, res, next) => {
  try {
    const { Id } = req.params;
    const { data: pesanan, error: fetchError } = await supabase
      .from('tabel_pesanan')
      .select('*, tabel_barang(id_barang, stok_saat_ini)')
      .eq('id_pesanan', Id)
      .single();

    if (fetchError || !pesanan) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    if (['Selesai', 'Dibatalkan'].includes(pesanan.status_pesanan)) {
      return res.status(400).json({ message: 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah.' });
    }

    const { data: barang, error: barangError } = await supabase
      .from('tabel_barang')
      .select('stok_saat_ini')
      .eq('id_barang', pesanan.id_barang)
      .single();

    if (barangError || !barang) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    if (barang.stok_saat_ini < pesanan.jumlah_pesanan) {
      return res.status(400).json({ message: 'Stok tidak mencukupi untuk menyelesaikan pesanan ini.' });
    }

    const { error: rpcError } = await supabase.rpc('catat_transaksi_stok', {
      p_id_barang: pesanan.id_barang,
      p_jenis_transaksi: 'keluar',
      p_jumlah: pesanan.jumlah_pesanan
    });

    if (rpcError) throw rpcError;

    const { data, error: updateError } = await supabase
      .from('tabel_pesanan')
      .update({ status_pesanan: 'Selesai', updated_at: new Date().toISOString() })
      .eq('id_pesanan', Id)
      .select('*, tabel_barang(nama_barang, stok_saat_ini)')
      .single();

    if (updateError) throw updateError;
    res.json({ message: 'Pesanan berhasil diselesaikan.', data });
  } catch (error) { next(error); }
});

router.post('/:Id/batalkan', async (req, res, next) => {
  try {
    const { Id } = req.params;
    const { data: pesanan, error: fetchError } = await supabase
      .from('tabel_pesanan')
      .select('*')
      .eq('id_pesanan', Id)
      .single();

    if (fetchError || !pesanan) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    if (['Selesai', 'Dibatalkan'].includes(pesanan.status_pesanan)) {
      return res.status(400).json({ message: 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah.' });
    }

    const { data, error } = await supabase
      .from('tabel_pesanan')
      .update({ status_pesanan: 'Dibatalkan', updated_at: new Date().toISOString() })
      .eq('id_pesanan', Id)
      .select('*, tabel_barang(nama_barang, stok_saat_ini)')
      .single();

    if (error) throw error;
    res.json({ message: 'Pesanan berhasil dibatalkan.', data });
  } catch (error) { next(error); }
});

export default router;
