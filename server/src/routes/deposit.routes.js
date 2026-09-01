const express = require('express');
const router = express.Router();
const depositController = require('../controllers/deposit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { uploadDeposit } = require('../middleware/upload.middleware');

// User routes
router.get('/addresses', authenticate, depositController.getDepositAddresses);
router.post('/', authenticate, depositController.createDepositValidation, depositController.createDeposit);
router.post('/:depositId/proof', authenticate, uploadDeposit.single('proof'), depositController.uploadDepositProof);
router.get('/my', authenticate, depositController.getMyDeposits);

// Admin routes — FIXED: changed :depositId to :id
router.get('/all', requireAdmin, depositController.getAllDeposits);
router.post('/:id/confirm', requireAdmin, depositController.confirmDeposit);
router.post('/:id/reject', requireAdmin, depositController.rejectDeposit);

module.exports = router;