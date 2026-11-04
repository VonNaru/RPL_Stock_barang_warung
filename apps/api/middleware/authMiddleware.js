/**
 * Middleware untuk mengidentifikasi pengguna yang sedang login (Multi-Tenant per Akun)
 */
export const authMiddleware = (req, _res, next) => {
  let userId = null;

  // 1. Ekstrak dari header x-user-id
  if (req.headers['x-user-id']) {
    userId = String(req.headers['x-user-id']).trim();
  }

  // 2. Ekstrak dari header Authorization: Bearer <base64Token>
  if (!userId && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [extractedId] = decoded.split(':');
        if (extractedId) {
          userId = extractedId.trim();
        }
      } catch {
        // Abaikan jika token bukan base64 valid
      }
    }
  }

  // 3. Ekstrak dari query parameter id_pengguna / userId
  if (!userId && (req.query.id_pengguna || req.query.userId)) {
    userId = String(req.query.id_pengguna || req.query.userId).trim();
  }

  // 4. Ekstrak dari request body jika ada
  if (!userId && req.body && typeof req.body === 'object') {
    if (req.body.id_pengguna || req.body.userId) {
      userId = String(req.body.id_pengguna || req.body.userId).trim();
    }
  }

  req.userId = userId || null;
  next();
};

/**
 * Middleware opsional untuk memastikan pengguna wajib login pada rute tertentu
 */
export const requireAuth = (req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Akses ditolak. Silakan login terlebih dahulu untuk mengakses data stok Anda.'
    });
  }
  next();
};

