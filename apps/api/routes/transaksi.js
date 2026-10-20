import { Router } from 'express';
import { supabase } from '../supabase.js';
import { validateTransaksiInput } from '../services/transaksiService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('tabel_transaksi')
      .select('*, tabel_barang(nama_barang, harga_beli, harga_jual)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const idBarang = req.body.id_barang ?? req.body.idBarang;
    const jenisTransaksi = req.body.jenis_transaksi ?? req.body.jenisTransaksi;
    const jumlah = req.body.jumlah;
    const hargaBeli = req.body.harga_beli ?? req.body.hargaBeli;
    const hargaJual = req.body.harga_jual ?? req.body.hargaJual;

    const validation = validateTransaksiInput({
      id_barang: idBarang,
      jenis_transaksi: jenisTransaksi,
      jumlah: jumlah,
      harga_beli: hargaBeli,
      harga_jual: hargaJual
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Barang, jenis transaksi, dan jumlah positif wajib diisi.',
        errors: validation.errors
      });
    }

    let inputHargaBeli = Number(validation.sanitized.harga_beli ?? (hargaBeli !== undefined && hargaBeli !== '' ? hargaBeli : 0));
    let inputHargaJual = Number(validation.sanitized.harga_jual ?? (hargaJual !== undefined && hargaJual !== '' ? hargaJual : 0));

    // Ambil data harga master dari tabel_barang jika harga belum disediakan
    if (
      (validation.sanitized.jenis_transaksi === 'masuk' && inputHargaBeli === 0) ||
      (validation.sanitized.jenis_transaksi === 'keluar' && inputHargaJual === 0)
    ) {
      const { data: barangData } = await supabase
        .from('tabel_barang')
        .select('harga_beli, harga_jual')
        .eq('id_barang', validation.sanitized.id_barang)
        .maybeSingle();

      if (barangData) {
        if (validation.sanitized.jenis_transaksi === 'masuk' && inputHargaBeli === 0) {
          inputHargaBeli = Number(barangData.harga_beli || 0);
        }
        if (validation.sanitized.jenis_transaksi === 'keluar' && inputHargaJual === 0) {
          inputHargaJual = Number(barangData.harga_jual || 0);
        }
      }
    }

    let { data, error } = await supabase.rpc('catat_transaksi_stok', {
      p_id_barang: validation.sanitized.id_barang,
      p_jenis_transaksi: validation.sanitized.jenis_transaksi,
      p_jumlah: validation.sanitized.jumlah,
      p_harga_beli: inputHargaBeli,
      p_harga_jual: inputHargaJual
    });

    // Fallback jika database masih menggunakan signature RPC lama (3 parameter)
    if (error && (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('parameter'))) {
      const fallback = await supabase.rpc('catat_transaksi_stok', {
        p_id_barang: validation.sanitized.id_barang,
        p_jenis_transaksi: validation.sanitized.jenis_transaksi,
        p_jumlah: validation.sanitized.jumlah
      });
      if (fallback.error) throw fallback.error;
      data = fallback.data;

      // Update harga pada tabel_transaksi
      const txUpdate = {};
      if (validation.sanitized.jenis_transaksi === 'masuk') {
        txUpdate.harga_beli = inputHargaBeli;
      } else {
        txUpdate.harga_jual = inputHargaJual;
      }
      if (data?.id_transaksi) {
        await supabase.from('tabel_transaksi').update(txUpdate).eq('id_transaksi', data.id_transaksi);
      }

      // Update harga master pada tabel_barang jika restok membawa harga baru
      if (validation.sanitized.jenis_transaksi === 'masuk') {
        const barangUpdate = {};
        if (inputHargaBeli > 0) barangUpdate.harga_beli = inputHargaBeli;
        if (inputHargaJual > 0) barangUpdate.harga_jual = inputHargaJual;
        if (Object.keys(barangUpdate).length > 0) {
          await supabase.from('tabel_barang').update(barangUpdate).eq('id_barang', validation.sanitized.id_barang);
        }
      }
    } else if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    if (error.message?.includes('STOK_TIDAK_CUKUP')) {
      return res.status(409).json({ message: 'Stok tidak mencukupi untuk transaksi keluar.' });
    }
    next(error);
  }
});

export default router;