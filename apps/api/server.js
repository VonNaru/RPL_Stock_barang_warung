import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/authMiddleware.js';
import barangRoutes from './routes/barang.js';
import transaksiRoutes from './routes/transaksi.js';
import pesananRoutes from './routes/pesanan.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';

const app = express();

// ----- Middleware & routes -----
app.use(cors());
app.use(express.json());

// 1. Public routes (no token needed)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

// 2. Auth middleware (satpam)
app.use(authMiddleware);

// 3. Private routes (require valid token)
app.use('/api/barang', barangRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/dashboard-stats', dashboardRoutes);

// ----- Error handling -----
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: 'Terjadi kesalahan pada server.',
    detail: error.message,
  });
});

// ----- Development server (run locally) -----
if (process.argv[1] === import.meta.url) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API berjalan di http://localhost:${port}`));
}

// Export the fully‑configured Express app for Netlify Functions
export default app;
