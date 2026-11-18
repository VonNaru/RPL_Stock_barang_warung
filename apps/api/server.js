require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./middleware/authMiddleware.js');
const barangRoutes = require('./routes/barang.js');
const transaksiRoutes = require('./routes/transaksi.js');
const pesananRoutes = require('./routes/pesanan.js');
const dashboardRoutes = require('./routes/dashboard.js');
const authRoutes = require('./routes/auth.js');

const app = express();

// ----- HELPER PENYELAMAT NETLIFY -----
// Extract default export if module wrapped in an object (for compatibility)
function fixRoute(route) {
  return route && typeof route === 'object' && 'default' in route ? route.default : route;
}

// ----- Middleware & routes -----
app.use(cors());
app.use(express.json());

// Pastikan req.body diparsing dengan benar jika serverless-http mengirimkan Buffer/String
app.use((req, _res, next) => {
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (e) {}
  } else if (typeof req.body === 'string' && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  }
  next();
});

// Create a router that will be mounted at all Netlify and local path variants
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

// Mount router untuk semua varian path agar tidak pernah 404 di Netlify
app.use('/.netlify/functions/api', apiRouter); // Handles /.netlify/functions/api/...
app.use('/api', apiRouter);                    // Handles /api/...
app.use('/', apiRouter);                       // Handles /... fallback

// ----- Error handling -----
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: 'Terjadi kesalahan pada server.',
    detail: error.message,
  });
});

// ----- Development server -----
// Optional: run locally when this file is executed directly
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API berjalan di http://localhost:${port}`));
}

// Export the fully-configured Express app for Netlify Functions
module.exports = app;
