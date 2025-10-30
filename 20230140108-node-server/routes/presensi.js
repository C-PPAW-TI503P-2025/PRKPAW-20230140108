const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { 
    addUserData, 
    validateUpdatePresensi, 
    handleValidationErrors 
  } = require('../middleware/permissionMiddleware');
  
  router.use(addUserData);
  
  router.post('/check-in', presensiController.CheckIn);
  router.post('/check-out', presensiController.CheckOut);
  
  // Tambahkan validation middleware
  router.put('/:id', 
    validateUpdatePresensi, 
    handleValidationErrors, 
    presensiController.updatePresensi
  );
  
  router.delete("/:id", presensiController.deletePresensi);
  
  module.exports = router;