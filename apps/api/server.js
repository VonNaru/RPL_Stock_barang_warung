import express from 'express';
import cors from 'cors';
import barangRoutes from './routes/barang.js';
import transaksiRoutes from './routes/transaksi.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/barang', barangRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: 'Terjadi kesalahan pada server.', detail: error.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API berjalan di http://localhost:${port}`));