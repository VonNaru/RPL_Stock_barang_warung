import { Router } from 'express';
import { supabase } from '../supabase.js';
import { calculateDashboardSummary } from '../services/barangService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    let barangQuery = supabase.from('tabel_barang').select('*');
    let transaksiQuery = supabase.from('tabel_transaksi').select('*');

    if (req.userId) {
      barangQuery = barangQuery.eq('id_pengguna', req.userId);
      transaksiQuery = transaksiQuery.eq('id_pengguna', req.userId);
    }

    const [barangRes, transaksiRes] = await Promise.all([
      barangQuery,
      transaksiQuery
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
