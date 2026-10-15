import { Router } from 'express';
import { supabase } from '../supabase.js';
import {
  canCancelOrder,
  canCompleteOrder,
  determineInitialOrderStatus,
  validatePesananInput
} from '../services/pesananService.js';

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
    const namaPelanggan = req.body.NamaPelanggan ?? req.body.nama_pelanggan ?? req.body.namaPelanggan;
    const idBarang = req.body.IdBarang ?? req.body.id_barang ?? req.body.idBarang;
    const jumlahPesanan = req.body.JumlahPesanan ?? req.body.jumlah_pesanan ?? req.body.jumlahPesanan;
    const catatan = req.body.Catatan ?? req.body.catatan ?? null;

    const validation = validatePesananInput({
      nama_pelanggan: namaPelanggan,
      id_barang: idBarang,
      jumlah_pesanan: jumlahPesanan,
      catatan
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Nama pelanggan, barang, dan jumlah pesanan positif wajib diisi.',
        errors: validation.errors
      });
    }

    const { data: barang, error: barangError } = await supabase
      .from('tabel_barang')
      .select('stok_saat_ini')
      .eq('id_barang', validation.sanitized.id_barang)
      .single();

    if (barangError || !barang) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    const statusPesanan = determineInitialOrderStatus({
      currentStock: barang.stok_saat_ini,
      jumlah_pesanan: validation.sanitized.jumlah_pesanan
    });

    const { data, error } = await supabase
      .from('tabel_pesanan')
      .insert({
        nama_pelanggan: validation.sanitized.nama_pelanggan,
        id_barang: validation.sanitized.id_barang,
        jumlah_pesanan: validation.sanitized.jumlah_pesanan,
        status_pesanan: statusPesanan,
        catatan: validation.sanitized.catatan
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

    const { data: barang, error: barangError } = await supabase
      .from('tabel_barang')
      .select('stok_saat_ini')
      .eq('id_barang', pesanan.id_barang)
      .single();

    if (barangError || !barang) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    const check = canCompleteOrder(pesanan, barang.stok_saat_ini);
    if (!check.canComplete) {
      return res.status(400).json({ message: check.reason });
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

    const check = canCancelOrder(pesanan);
    if (!check.canCancel) {
      return res.status(400).json({ message: check.reason });
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
