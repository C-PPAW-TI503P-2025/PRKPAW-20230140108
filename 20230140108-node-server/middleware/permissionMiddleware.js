const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

// ============ JWT AUTHENTICATION MIDDLEWARE ============

exports.authenticateToken = (req, res, next) => {
  // Ambil token dari header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login terlebih dahulu.' });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Simpan data user dari payload token ke req.user
    req.user = {
      id: decoded.id,
      nama: decoded.nama,
      role: decoded.role
    };
    
    console.log('Middleware: User authenticated:', req.user.nama);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token telah kadaluarsa. Silakan login kembali.' });
    }
    return res.status(403).json({ message: 'Token tidak valid.' });
  }
};

// ============ AUTHORIZATION MIDDLEWARE ============

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('Middleware: Izin admin diberikan.');
    next(); 
  } else {
    console.log('Middleware: Gagal! Pengguna bukan admin.');
    return res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin'});
  }
};

// ============ VALIDATION MIDDLEWARE ============

// Validation rules untuk update presensi
exports.validateUpdatePresensi = [
  body('checkIn')
    .optional()
    .isISO8601()
    .withMessage('checkIn harus berupa format tanggal yang valid (ISO 8601)')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('checkIn harus berupa tanggal yang valid');
      }
      return true;
    }),
  
  body('checkOut')
    .optional()
    .isISO8601()
    .withMessage('checkOut harus berupa format tanggal yang valid (ISO 8601)')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('checkOut harus berupa tanggal yang valid');
      }
      return true;
    }),

  // Custom validation: checkOut harus setelah checkIn
  body('checkOut').custom((checkOut, { req }) => {
    if (checkOut && req.body.checkIn) {
      const checkInDate = new Date(req.body.checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (checkOutDate <= checkInDate) {
        throw new Error('checkOut harus setelah checkIn');
      }
    }
    return true;
  }),
];

// Middleware untuk menangani validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validasi gagal',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};