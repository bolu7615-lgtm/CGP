const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// User routes
router.get('/stats', authenticate, transactionController.getStats);

// Admin routes
router.get('/all', requireAdmin, transactionController.getAllTransactions);
router.get('/platform-stats', requireAdmin, transactionController.getPlatformStats);

module.exports = router;