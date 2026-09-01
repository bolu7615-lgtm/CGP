const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// Public routes
router.get('/plans', investmentController.getPlans);
router.get('/plans/:id', investmentController.getPlanById);

// User routes
router.post('/', authenticate, investmentController.createInvestmentValidation, investmentController.createInvestment);
router.get('/my', authenticate, investmentController.getMyInvestments);
router.get('/my/:id', authenticate, investmentController.getInvestmentById);

// Admin routes
router.get('/all', requireAdmin, investmentController.getAllInvestments);
router.post('/process-profits', requireAdmin, investmentController.processDailyProfits);

module.exports = router;