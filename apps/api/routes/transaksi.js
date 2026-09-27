import { Router } from 'express';
import { supabase } from '../supabase.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('tabel_transaksi')
      .select('*, tabel_barang(nama_barang)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_barang: idBarang, jenis_transaksi: jenisTransaksi, jumlah } = req.body;
    if (!idBarang || !['masuk', 'keluar'].includes(jenisTransaksi) || !Number.isInteger(jumlah) || jumlah <= 0) {
      return res.status(400).json({ message: 'Barang, jenis transaksi, dan jumlah positif wajib diisi.' });
    }
    const { data, error } = await supabase.rpc('catat_transaksi_stok', {
      p_id_barang: idBarang, p_jenis_transaksi: jenisTransaksi, p_jumlah: jumlah
    });
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    if (error.message?.includes('STOK_TIDAK_CUKUP')) return res.status(409).json({ message: 'Stok tidak mencukupi untuk transaksi keluar.' });
    next(error);
  }
});

export default router;