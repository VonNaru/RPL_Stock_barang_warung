import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/authMiddleware.js';
import barangRoutes from './routes/barang.js';
import transaksiRoutes from './routes/transaksi.js';
import pesananRoutes from './routes/pesanan.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';

const app = express();

// ----- HELPER PENYELAMAT NETLIFY -----
// Mengekstrak router secara otomatis jika dibungkus menjadi Object oleh Netlify
const fixRoute = (route) => (route && typeof route === 'object' && route.default) ? route.default : route;

// ----- Middleware & routes -----
app.use(cors());
app.use(express.json());

// 1. Rute Publik (Bebas akses)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', fixRoute(authRoutes));

// 2. Pasang Middleware (Satpam)
app.use(authMiddleware);

// 3. Rute Privat (Wajib Token)
app.use('/api/barang', fixRoute(barangRoutes));
app.use('/api/transaksi', fixRoute(transaksiRoutes));
app.use('/api/pesanan', fixRoute(pesananRoutes));
app.use('/api/dashboard-stats', fixRoute(dashboardRoutes));

// ----- Error handling -----
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: 'Terjadi kesalahan pada server.',
    detail: error.message,
  });
});

// ----- Development server -----
// Opsional: Untuk run lokal di komputer lu
if (process.argv[1] === import.meta.url) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API berjalan di http://localhost:${port}`));
}

// Export the fully-configured Express app for Netlify Functions
export default app;