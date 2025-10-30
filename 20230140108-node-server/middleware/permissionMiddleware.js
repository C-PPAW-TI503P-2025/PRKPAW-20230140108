const { body, validationResult } = require('express-validator');

exports.addUserData = (req, res, next) => {
  console.log('Middleware: Menambahkan data user dummy...');
  req.user = {
    id: 123,
    nama: 'User Karyawan',
    role: 'admin'
  };
  next(); 
};

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

  body('nama')
    .optional()
    .isString()
    .withMessage('nama harus berupa string')
    .trim()
    .notEmpty()
    .withMessage('nama tidak boleh kosong'),

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