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

// Create a router that will be mounted at both "/api" (local) and "/" (Netlify)
const apiRouter = express.Router();

// 1. Public routes (no auth middleware)
apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.use('/auth', fixRoute(authRoutes));

// 2. Auth middleware (protect subsequent routes)
apiRouter.use(authMiddleware);

// 3. Private routes (require token)
apiRouter.use('/barang', fixRoute(barangRoutes));
apiRouter.use('/transaksi', fixRoute(transaksiRoutes));
apiRouter.use('/pesanan', fixRoute(pesananRoutes));
apiRouter.use('/dashboard-stats', fixRoute(dashboardRoutes));

// Mount the router for both local development and Netlify entry point
app.use('/api', apiRouter); // Handles /api/... locally
app.use('/', apiRouter);    // Handles /... when called via Netlify Functions


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