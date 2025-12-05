const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { 
  authenticateToken, 
  isAdmin,
  validateUpdatePresensi,  
  handleValidationErrors   
} = require('../middleware/permissionMiddleware');

// Terapkan auth ke semua routes
router.use(authenticateToken);

// Check-in dengan upload foto (JANGAN tambahkan authenticateToken lagi)
router.post('/check-in', presensiController.upload.single('image'), presensiController.CheckIn);

router.post('/check-out', presensiController.CheckOut);

router.put('/:id', 
  isAdmin,    
  validateUpdatePresensi, 
  handleValidationErrors, 
  presensiController.updatePresensi
);

router.delete("/:id", presensiController.deletePresensi);

module.exports = router;