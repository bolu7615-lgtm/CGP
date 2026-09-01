const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');
const { sendWithdrawalEmail } = require('../utils/email');
const { generateWithdrawalId } = require('../utils/generateId');

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

    res.json({
      success: true,
      data: {
        availableBalance: wallet.availableBalance,
        minimumWithdrawal: parseFloat(minSetting?.value || 100),
        feePercentage: parseFloat(feeSetting?.value || 2),
        supportedCurrencies: ['BTC', 'ETH', 'USDT-TRC20', 'USDT-ERC20', 'BNB', 'SOL'],
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
};