const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, walletController.getWallet);
router.get('/transactions', authenticate, walletController.getTransactions);
router.get('/transactions/:id', authenticate, walletController.getTransactionById);
router.get('/earnings-history', authenticate, walletController.getEarningsHistory);

module.exports = router;