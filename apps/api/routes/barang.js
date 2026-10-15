import { Router } from 'express';
import { supabase } from '../supabase.js';
import { filterLowStock, validateBarangInput } from '../services/barangService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('tabel_barang').select('*').order('nama_barang');
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

router.get('/low-stock', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('tabel_barang').select('*').order('stok_saat_ini');
    if (error) throw error;
    res.json(filterLowStock(data || []));
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const namaBarang = req.body.nama_barang ?? req.body.namaBarang;
    const stokSaatIni = req.body.stok_saat_ini ?? req.body.stokSaatIni ?? 0;
    const stokMinimum = req.body.stok_minimum ?? req.body.stokMinimum ?? 0;

    const validation = validateBarangInput({
      nama_barang: namaBarang,
      stok_saat_ini: stokSaatIni,
      stok_minimum: stokMinimum
    });

    if (!validation.isValid) {
      return res.status(400).json({ message: 'Nama dan jumlah stok harus diisi dengan benar.', errors: validation.errors });
    }

    const { data, error } = await supabase.from('tabel_barang').insert(validation.sanitized).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const namaBarang = req.body.nama_barang ?? req.body.namaBarang;
    const stokSaatIni = req.body.stok_saat_ini ?? req.body.stokSaatIni;
    const stokMinimum = req.body.stok_minimum ?? req.body.stokMinimum;

    const validation = validateBarangInput({
      nama_barang: namaBarang,
      stok_saat_ini: stokSaatIni,
      stok_minimum: stokMinimum
    });

    if (!validation.isValid) {
      return res.status(400).json({ message: 'Data barang tidak valid.', errors: validation.errors });
    }

    const { data, error } = await supabase.from('tabel_barang').update(validation.sanitized).eq('id_barang', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

export default router;