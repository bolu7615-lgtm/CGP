const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawal.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// User routes
router.get('/info', authenticate, withdrawalController.getWithdrawalInfo);
router.post('/', authenticate, withdrawalController.createWithdrawalValidation, withdrawalController.createWithdrawal);
router.get('/my', authenticate, withdrawalController.getMyWithdrawals);

// Admin routes
router.get('/all', requireAdmin, withdrawalController.getAllWithdrawals);
router.post('/:withdrawalId/process', requireAdmin, withdrawalController.processWithdrawal);
router.post('/:withdrawalId/reject', requireAdmin, withdrawalController.rejectWithdrawal);

module.exports = router;