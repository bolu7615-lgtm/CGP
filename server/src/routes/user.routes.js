const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfileValidation, userController.updateProfile);
router.put('/settings', authenticate, userController.updateSettingsValidation, userController.updateSettings);
router.get('/sessions', authenticate, userController.getSessions);
router.delete('/sessions/:sessionId', authenticate, userController.revokeSession);
router.get('/referrals', authenticate, userController.getReferrals);

module.exports = router;