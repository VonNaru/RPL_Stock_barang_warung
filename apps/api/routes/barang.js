import { Router } from 'express';
import { supabase } from '../supabase.js';

const router = Router();
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

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
    res.json(data.filter((barang) => barang.stok_saat_ini <= barang.stok_minimum));
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { nama_barang: namaBarang, stok_saat_ini: stokSaatIni = 0, stok_minimum: stokMinimum = 0 } = req.body;
    if (!namaBarang?.trim() || !isNonNegativeInteger(stokSaatIni) || !isNonNegativeInteger(stokMinimum)) {
      return res.status(400).json({ message: 'Nama dan jumlah stok harus diisi dengan benar.' });
    }
    const { data, error } = await supabase.from('tabel_barang').insert({
      nama_barang: namaBarang.trim(), stok_saat_ini: stokSaatIni, stok_minimum: stokMinimum
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nama_barang: namaBarang, stok_saat_ini: stokSaatIni, stok_minimum: stokMinimum } = req.body;
    if (!namaBarang?.trim() || !isNonNegativeInteger(stokSaatIni) || !isNonNegativeInteger(stokMinimum)) {
      return res.status(400).json({ message: 'Data barang tidak valid.' });
    }
    const { data, error } = await supabase.from('tabel_barang').update({
      nama_barang: namaBarang.trim(), stok_saat_ini: stokSaatIni, stok_minimum: stokMinimum
    }).eq('id_barang', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});

export default router;