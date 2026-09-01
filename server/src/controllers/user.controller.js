const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');
const { sendSecurityAlertEmail } = require('../utils/email');

// ==================== VALIDATION ====================

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  body('country').optional().trim(),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
];

const updateSettingsValidation = [
  body('emailNotifications').optional().isBoolean(),
];

// ==================== GET PROFILE ====================

async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        wallet: true,
        kycDocuments: true,
        _count: {
          select: {
            referrals: true,
            investments: true,
            transactions: true,
          },
        },
      },
    });

    const { password, twoFactorSecret, emailVerifyToken, emailVerifyExpires, ...profile } = user;

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== UPDATE PROFILE ====================

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone, country, city, address, dateOfBirth } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        country: country || undefined,
        city: city || undefined,
        address: address || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
      include: { wallet: true },
    });

    const { password, twoFactorSecret, emailVerifyToken, emailVerifyExpires, ...profile } = user;

    res.json({
      success: true,
      message: 'Profile updated',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== UPDATE SETTINGS ====================

async function updateSettings(req, res, next) {
  try {
    const { emailNotifications } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
      },
    });

    res.json({
      success: true,
      message: 'Settings updated',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET SESSIONS / DEVICES ====================

async function getSessions(req, res, next) {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        device: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Mark current session
    const currentToken = req.token;
    const sessionsWithCurrent = await Promise.all(
      sessions.map(async (session) => {
        const isCurrent = session.token === currentToken;
        return { ...session, isCurrent };
      })
    );

    res.json({
      success: true,
      data: sessionsWithCurrent,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== REVOKE SESSION ====================

async function revokeSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await prisma.session.delete({ where: { id: sessionId } });

    res.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    next(error);
  }
}

// ==================== GET REFERRALS ====================

async function getReferrals(req, res, next) {
  try {
    const userId = req.user.id;

    const referrals = await prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        kycStatus: true,
        _count: {
          select: { investments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const earnings = await prisma.referralEarning.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalEarned = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.json({
      success: true,
      data: {
        referralCode: req.user.referralCode,
        referralLink: `${process.env.FRONTEND_URL}/register?ref=${req.user.referralCode}`,
        totalReferrals: referrals.length,
        totalEarned,
        referrals,
        recentEarnings: earnings,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateProfileValidation,
  updateSettingsValidation,
  getProfile,
  updateProfile,
  updateSettings,
  getSessions,
  revokeSession,
  getReferrals,
};