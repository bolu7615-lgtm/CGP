const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { uploadKyc } = require('../middleware/upload.middleware');

// User routes
router.post(
  '/submit',
  authenticate,
  uploadKyc.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
  ]),
  kycController.submitKyc
);
router.get('/status', authenticate, kycController.getKycStatus);

// Admin routes
router.get('/all', requireAdmin, kycController.getAllKyc);
router.get('/:userId', requireAdmin, kycController.getKycById);
router.post('/:userId/approve', requireAdmin, kycController.approveKyc);
router.post('/:userId/reject', requireAdmin, kycController.rejectKyc);

module.exports = router;