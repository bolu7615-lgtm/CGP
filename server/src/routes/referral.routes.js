const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/leaderboard', referralController.getLeaderboard);
router.get('/my-stats', authenticate, referralController.getMyReferralStats);

module.exports = router;