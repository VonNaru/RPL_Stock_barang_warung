import { Router } from 'express';
import { supabase } from '../supabase.js';
import { calculateDashboardSummary } from '../services/barangService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [barangRes, transaksiRes] = await Promise.all([
      supabase.from('tabel_barang').select('*'),
      supabase.from('tabel_transaksi').select('*')
    ]);

    if (barangRes.error) throw barangRes.error;
    if (transaksiRes.error) throw transaksiRes.error;

    const summary = calculateDashboardSummary({
      barangList: barangRes.data || [],
      transaksiList: transaksiRes.data || []
    });

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
