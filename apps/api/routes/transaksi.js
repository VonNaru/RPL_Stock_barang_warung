import { Router } from 'express';
import { supabase } from '../supabase.js';
import { validateTransaksiInput } from '../services/transaksiService.js';

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
    const idBarang = req.body.id_barang ?? req.body.idBarang;
    const jenisTransaksi = req.body.jenis_transaksi ?? req.body.jenisTransaksi;
    const jumlah = req.body.jumlah;

    const validation = validateTransaksiInput({
      id_barang: idBarang,
      jenis_transaksi: jenisTransaksi,
      jumlah: jumlah
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Barang, jenis transaksi, dan jumlah positif wajib diisi.',
        errors: validation.errors
      });
    }

    const { data, error } = await supabase.rpc('catat_transaksi_stok', {
      p_id_barang: validation.sanitized.id_barang,
      p_jenis_transaksi: validation.sanitized.jenis_transaksi,
      p_jumlah: validation.sanitized.jumlah
    });

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    if (error.message?.includes('STOK_TIDAK_CUKUP')) {
      return res.status(409).json({ message: 'Stok tidak mencukupi untuk transaksi keluar.' });
    }
    next(error);
  }
});

export default router;