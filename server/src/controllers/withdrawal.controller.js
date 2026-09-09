const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');
const { sendWithdrawalEmail } = require('../utils/email');
const { generateWithdrawalId } = require('../utils/generateId');

// ==================== CONSTANTS ====================

const LOCK_THRESHOLD = 4000; // $4,000 minimum deposit to lock funds
const TERM_DAYS = 60; // 60-day investment term

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if user's funds are locked (totalDeposited >= $4,000)
 */
async function isFundsLocked(userId) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) return false;

  const totalDeposited = parseFloat(wallet.totalDeposited || 0);
  return totalDeposited >= LOCK_THRESHOLD;
}

/**
 * Get the first deposit date (term start date)
 */
async function getTermStartDate(userId) {
  const firstDeposit = await prisma.deposit.findFirst({
    where: {
      userId,
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'asc' },
  });

  return firstDeposit?.createdAt || null;
}

/**
 * Check if the 60-day term has ended
 */
async function isTermEnded(userId) {
  const termStartDate = await getTermStartDate(userId);

  if (!termStartDate) {
    // No deposits yet, term hasn't started
    return false;
  }

  const termEndDate = new Date(termStartDate);
  termEndDate.setDate(termEndDate.getDate() + TERM_DAYS);

  return new Date() >= termEndDate;
}

/**
 * Get days remaining in term
 */
async function getDaysRemaining(userId) {
  const termStartDate = await getTermStartDate(userId);

  if (!termStartDate) {
    return TERM_DAYS;
  }

  const termEndDate = new Date(termStartDate);
  termEndDate.setDate(termEndDate.getDate() + TERM_DAYS);

  const now = new Date();
  const diffTime = termEndDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Check if withdrawals are allowed for user
 */
async function canWithdraw(userId) {
  const fundsLocked = await isFundsLocked(userId);
  const termEnded = await isTermEnded(userId);

  // If funds are locked (>= $4,000 deposited), withdrawals only allowed after term ends
  if (fundsLocked) {
    return {
      allowed: termEnded,
      reason: termEnded ? null : `Funds are locked. ${await getDaysRemaining(userId)} days remaining in your ${TERM_DAYS}-day term.`,
      daysRemaining: await getDaysRemaining(userId),
      termEnded,
      fundsLocked,
    };
  }

  // If funds are not locked (< $4,000), allow withdrawals
  return {
    allowed: true,
    reason: null,
    daysRemaining: 0,
    termEnded: true,
    fundsLocked: false,
  };
}

// ==================== VALIDATION ====================

const createWithdrawalValidation = [
  body('amount').isFloat({ min: 100 }).withMessage('Minimum withdrawal is $100'),
  body('cryptoCurrency').isIn(['BTC', 'ETH', 'USDT-TRC20', 'USDT-ERC20', 'BNB', 'SOL']),
  body('walletAddress').trim().isLength({ min: 10 }).withMessage('Valid wallet address required'),
  body('network').trim().notEmpty().withMessage('Network required'),
];

// ==================== GET WITHDRAWAL INFO ====================

async function getWithdrawalInfo(req, res, next) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
    });

    // Get minimum withdrawal from settings
    const minSetting = await prisma.siteSetting.findUnique({
      where: { key: 'MIN_WITHDRAWAL' },
    });

    const feeSetting = await prisma.siteSetting.findUnique({
      where: { key: 'WITHDRAWAL_FEE' },
    });

    // Check withdrawal lock status
    const withdrawalStatus = await canWithdraw(req.user.id);

    res.json({
      success: true,
      data: {
        availableBalance: withdrawalStatus.allowed ? wallet.availableBalance : 0,
        actualBalance: wallet.availableBalance,
        minimumWithdrawal: parseFloat(minSetting?.value || 100),
        feePercentage: parseFloat(feeSetting?.value || 2),
        supportedCurrencies: ['BTC', 'ETH', 'USDT-TRC20', 'USDT-ERC20', 'BNB', 'SOL'],
        // Lock status fields
        withdrawalsLocked: !withdrawalStatus.allowed,
        lockReason: withdrawalStatus.reason,
        daysRemaining: withdrawalStatus.daysRemaining,
        termEnded: withdrawalStatus.termEnded,
        fundsLocked: withdrawalStatus.fundsLocked,
        termDays: TERM_DAYS,
        lockThreshold: LOCK_THRESHOLD,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== CREATE WITHDRAWAL ====================

async function createWithdrawal(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { amount, cryptoCurrency, walletAddress, network } = req.body;

    // Check KYC status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (user.kycStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required before withdrawal',
      });
    }

    // Check if withdrawals are allowed (60-day term check)
    const withdrawalStatus = await canWithdraw(userId);
    if (!withdrawalStatus.allowed) {
      return res.status(403).json({
        success: false,
        message: withdrawalStatus.reason || 'Withdrawals are currently locked',
        data: {
          daysRemaining: withdrawalStatus.daysRemaining,
          termEnded: withdrawalStatus.termEnded,
          fundsLocked: withdrawalStatus.fundsLocked,
        },
      });
    }

    const wallet = user.wallet;

    // Check minimum withdrawal
    const minSetting = await prisma.siteSetting.findUnique({
      where: { key: 'MIN_WITHDRAWAL' },
    });
    const minWithdrawal = parseFloat(minSetting?.value || 100);

    if (parseFloat(amount) < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal is $${minWithdrawal}`,
      });
    }

    // Check available balance
    if (parseFloat(wallet.availableBalance) < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance',
      });
    }

    // Calculate fee
    const feeSetting = await prisma.siteSetting.findUnique({
      where: { key: 'WITHDRAWAL_FEE' },
    });
    const feePercent = parseFloat(feeSetting?.value || 2);
    const fee = (parseFloat(amount) * feePercent) / 100;
    const netAmount = parseFloat(amount) - fee;

    // Calculate crypto amount
    const prices = {
      BTC: 67432.21,
      ETH: 3512.75,
      'USDT-TRC20': 1.00,
      'USDT-ERC20': 1.00,
      BNB: 575.45,
      SOL: 152.39,
    };

    const cryptoAmount = netAmount / prices[cryptoCurrency];

    // Create withdrawal
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount: parseFloat(amount),
        cryptoAmount,
        cryptoCurrency,
        walletAddress,
        network,
        fee,
        status: 'PENDING',
      },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        amount: parseFloat(amount),
        currency: 'USD',
        cryptoAmount,
        cryptoCurrency,
        withdrawalId: withdrawal.id,
        description: `Withdrawal of $${amount} to ${cryptoCurrency} (${network})`,
      },
    });

    // Deduct from available balance immediately (pending)
    await prisma.wallet.update({
      where: { userId },
      data: {
        availableBalance: { decrement: parseFloat(amount) },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted. Pending admin approval.',
      data: {
        withdrawalId: withdrawal.id,
        amount: withdrawal.amount,
        fee,
        netAmount,
        cryptoAmount,
        cryptoCurrency,
        walletAddress,
        network,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET MY WITHDRAWALS ====================

async function getMyWithdrawals(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.withdrawal.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: GET ALL WITHDRAWALS ====================

async function getAllWithdrawals(req, res, next) {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              kycStatus: true,
            },
          },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: PROCESS WITHDRAWAL ====================

async function processWithdrawal(req, res, next) {
  try {
    const { withdrawalId } = req.params;
    const { txHash } = req.body;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Withdrawal is already ${withdrawal.status}`,
      });
    }

    // Update withdrawal
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        processedById: req.user.id,
        txHash: txHash || null,
      },
    });

    // Update transaction
    await prisma.transaction.updateMany({
      where: { withdrawalId },
      data: { status: 'COMPLETED' },
    });

    // Update wallet total balance and total withdrawn
    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: {
        totalBalance: { decrement: withdrawal.amount },
        totalWithdrawn: { increment: withdrawal.amount },
      },
    });

    // Send email
    await sendWithdrawalEmail(
      withdrawal.user.email,
      withdrawal.user.firstName,
      withdrawal.amount,
      withdrawal.cryptoCurrency,
      txHash,
      withdrawal.walletAddress
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'WITHDRAWAL_PROCESSED',
        entityType: 'WITHDRAWAL',
        entityId: withdrawalId,
        newValue: { status: 'COMPLETED', txHash },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'Withdrawal processed successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: REJECT WITHDRAWAL ====================

async function rejectWithdrawal(req, res, next) {
  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason required (min 5 characters)',
      });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Withdrawal is already ${withdrawal.status}`,
      });
    }

    // Update withdrawal
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        processedById: req.user.id,
      },
    });

    // Update transaction
    await prisma.transaction.updateMany({
      where: { withdrawalId },
      data: { status: 'FAILED' },
    });

    // Refund available balance
    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: {
        availableBalance: { increment: withdrawal.amount },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'WITHDRAWAL_REJECTED',
        entityType: 'WITHDRAWAL',
        entityId: withdrawalId,
        newValue: { status: 'REJECTED', reason },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'Withdrawal rejected and amount refunded',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createWithdrawalValidation,
  getWithdrawalInfo,
  createWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  processWithdrawal,
  rejectWithdrawal,
  // Export helpers for use in other controllers
  canWithdraw,
  isFundsLocked,
  isTermEnded,
  getDaysRemaining,
};