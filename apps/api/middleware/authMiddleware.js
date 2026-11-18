// Middleware to identify logged-in user (multi-tenant per account)
const authMiddleware = (req, _res, next) => {
  let userId = null;

  // 1. Extract from header x-user-id
  if (req.headers['x-user-id']) {
    userId = String(req.headers['x-user-id']).trim();
  }

  // 2. Extract from Authorization: Bearer <base64Token>
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
        // ignore invalid base64
      }
    }
  }

  // 3. Extract from query parameters id_pengguna / userId
  if (!userId && (req.query.id_pengguna || req.query.userId)) {
    userId = String(req.query.id_pengguna || req.query.userId).trim();
  }

  // 4. Extract from request body if present
  if (!userId && req.body && typeof req.body === 'object') {
    if (req.body.id_pengguna || req.body.userId) {
      userId = String(req.body.id_pengguna || req.body.userId).trim();
    }
  }

  req.userId = userId || null;
  next();
};

// Optional middleware to enforce authentication on protected routes
const requireAuth = (req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Akses ditolak. Silakan login terlebih dahulu untuk mengakses data stok Anda.'
    });
  }
  next();
};

module.exports = { authMiddleware, requireAuth };
