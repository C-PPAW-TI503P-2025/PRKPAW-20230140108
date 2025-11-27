const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');

// Requirement: Gunakan process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token tidak disediakan." });
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token tidak valid atau kedaluwarsa." });
    }
    req.user = userPayload;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya untuk admin." });
  }
};

// ... existing code ...
// Helper functions needed by routes/presensi.js
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