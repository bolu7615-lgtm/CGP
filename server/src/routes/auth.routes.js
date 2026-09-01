const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', authController.registerValidation, authController.register);
router.post('/verify-email', authController.verifyEmailValidation, authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.loginValidation, authController.login);
router.post('/verify-login-otp', authController.loginOtpValidation, authController.verifyLoginOtp);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.getMe);

module.exports = router;