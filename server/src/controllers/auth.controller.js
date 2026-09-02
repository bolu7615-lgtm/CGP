const prisma = require('../config/database');
const { validationResult, body } = require('express-validator');
const {
  generateOtp,
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateToken,
} = require('../utils/crypto');
const {
  sendWelcomeEmail,
  sendLoginOtpEmail,
  sendPasswordChangedEmail,
  sendSecurityAlertEmail,
} = require('../utils/email');
const { generateReferralCode } = require('../utils/generateId');

// ==================== VALIDATION RULES ====================

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
  body('phone').optional().trim(),
  body('country').optional().trim(),
  body('referralCode').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const verifyEmailValidation = [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
];

const loginOtpValidation = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
];

// ==================== REGISTER ====================

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password, firstName, lastName, phone, country, referralCode } = req.body;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification code
    const verifyCode = generateOtp();
    const verifyExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Handle referral
    let referredById = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

     // Create user with wallet (KYC auto-verified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        country: country || null,
        referralCode: generateReferralCode(),
        referredById,
        emailVerifyToken: verifyCode,
        emailVerifyExpires: verifyExpires,
        // Auto-verify KYC for all new users
        kycStatus: 'APPROVED',
        kycVerifiedAt: new Date(),
        kycSubmittedAt: new Date(),
        wallet: {
          create: {
            btcAddress: `bc1${generateToken(20)}`,
            ethAddress: `0x${generateToken(20)}`,
            usdtTrc20Address: `T${generateToken(20)}`,
            usdtErc20Address: `0x${generateToken(20)}`,
            bnbAddress: `0x${generateToken(20)}`,
            solAddress: generateToken(22),
          },
        },
      },
      include: { wallet: true },
    });

    // Send welcome email with verification code
    await sendWelcomeEmail(email, firstName, verifyCode);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      data: {
        userId: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== VERIFY EMAIL ====================

async function verifyEmail(req, res, next) {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (user.emailVerifyToken !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (user.emailVerifyExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code expired' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== RESEND VERIFICATION ====================

async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const verifyCode = generateOtp();
    const verifyExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: verifyCode,
        emailVerifyExpires: verifyExpires,
      },
    });

    await sendWelcomeEmail(email, user.firstName, verifyCode);

    res.json({
      success: true,
      message: 'Verification code resent',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== LOGIN (STEP 1) ====================

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Account locked. Try again later.',
      });
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      // Increment login attempts
      const attempts = user.loginAttempts + 1;
      const updateData = { loginAttempts: attempts };

      if (attempts >= 5) {
        updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock 30 min
      }

      await prisma.user.update({ where: { id: user.id }, data: updateData });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: Math.max(0, 5 - attempts),
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
        needsVerification: true,
      });
    }

    // Reset login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null },
    });

    // If 2FA is enabled, send OTP
    if (user.twoFactorEnabled) {
      const otp = generateOtp();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifyToken: otp, // Reuse field for 2FA OTP
          emailVerifyExpires: otpExpires,
        },
      });

      await sendLoginOtpEmail(email, user.firstName, otp);

      return res.json({
        success: true,
        message: '2FA code sent to your email',
        requires2FA: true,
        userId: user.id,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Create session with BOTH tokens
    await prisma.session.create({
      data: {
        token: accessToken,        // Store access token for session lookup
        refreshToken: refreshToken, // Store refresh token separately
        userId: user.id,
        device: req.headers['user-agent']?.substring(0, 200),
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== VERIFY LOGIN OTP (STEP 2) ====================

async function verifyLoginOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.emailVerifyToken !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.emailVerifyExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Create session with BOTH tokens
    await prisma.session.create({
      data: {
        token: accessToken,        // Store access token for session lookup
        refreshToken: refreshToken, // Store refresh token separately
        userId: user.id,
        device: req.headers['user-agent']?.substring(0, 200),
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip,
      },
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== REFRESH TOKEN ====================

async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find session by refresh token
    const session = await prisma.session.findFirst({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.isActive || user.isBanned) {
      return res.status(401).json({ success: false, message: 'Invalid user' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });

    // Update session with new access token
    await prisma.session.update({
      where: { id: session.id },
      data: { token: newAccessToken },
    });

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    next(error);
  }
}

// ==================== LOGOUT ====================

async function logout(req, res, next) {
  try {
    const token = req.token;

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

// ==================== LOGOUT ALL DEVICES ====================

async function logoutAll(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.session.deleteMany({
      where: { userId },
    });

    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
}

// ==================== FORGOT PASSWORD ====================

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists, a reset link has been sent.',
      });
    }

    const resetToken = generateToken(32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: resetToken,
        emailVerifyExpires: resetExpires,
      },
    });

    // In production, send actual email with reset link
    // For now, return token in response (dev only)
    res.json({
      success: true,
      message: 'Password reset initiated',
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    next(error);
  }
}

// ==================== RESET PASSWORD ====================

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    // Delete all sessions
    await prisma.session.deleteMany({ where: { userId: user.id } });

    await sendPasswordChangedEmail(user.email, user.firstName);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

// ==================== CHANGE PASSWORD ====================

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete all other sessions
    await prisma.session.deleteMany({
      where: {
        userId,
        token: { not: req.token },
      },
    });

    await sendPasswordChangedEmail(user.email, user.firstName);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

// ==================== GET ME ====================

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        wallet: true,
        referredBy: {
          select: { firstName: true, lastName: true, referralCode: true },
        },
        _count: {
          select: { referrals: true, investments: true },
        },
      },
    });

    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// ==================== HELPER ====================

function sanitizeUser(user) {
  const { password, twoFactorSecret, emailVerifyToken, emailVerifyExpires, ...safe } = user;
  return safe;
}

module.exports = {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  loginOtpValidation,
  register,
  verifyEmail,
  resendVerification,
  login,
  verifyLoginOtp,
  refreshToken,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};