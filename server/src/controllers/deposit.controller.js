const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');
const { sendDepositEmail, sendPlansLockedEmail } = require('../utils/email');
const { generateDepositId } = require('../utils/generateId');

// ==================== VALIDATION ====================

const createDepositValidation = [
  body('amount').isFloat({ min: 50, max: 1000 }).withMessage('Deposit amount must be between $50 and $1,000'),
  body('cryptoCurrency').isIn(['BTC', 'ETH', 'USDT-TRC20', 'USDT-ERC20', 'BNB', 'SOL']),
];

// ==================== GET DEPOSIT ADDRESSES ====================

async function getDepositAddresses(req, res, next) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
    });

    const addresses = {
      BTC: { address: wallet.btcAddress, network: 'Bitcoin' },
      ETH: { address: wallet.ethAddress, network: 'Ethereum (ERC20)' },
      'USDT-TRC20': { address: wallet.usdtTrc20Address, network: 'Tron (TRC20)' },
      'USDT-ERC20': { address: wallet.usdtErc20Address, network: 'Ethereum (ERC20)' },
      BNB: { address: wallet.bnbAddress, network: 'BSC (BEP20)' },
      SOL: { address: wallet.solAddress, network: 'Solana' },
    };

    const prices = {
      BTC: 67432.21,
      ETH: 3512.75,
      'USDT-TRC20': 1.00,
      'USDT-ERC20': 1.00,
      BNB: 575.45,
      SOL: 152.39,
    };

    res.json({
      success: true,
      data: { addresses, prices },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== CREATE DEPOSIT ====================

async function createDeposit(req, res, next) {
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
    const { amount, cryptoCurrency, fromAddress } = req.body;

    // Check user's total deposited amount
    const userDeposits = await prisma.deposit.aggregate({
      where: {
        userId,
        status: { in: ['PENDING', 'CONFIRMING', 'COMPLETED'] },
      },
      _sum: { amount: true },
    });

    const totalDeposited = userDeposits._sum.amount || 0;
    const newTotal = totalDeposited + parseFloat(amount);

    if (newTotal > 1000) {
      const remaining = Math.max(0, 1000 - totalDeposited);
      return res.status(400).json({
        success: false,
        message: remaining > 0 
          ? `Maximum deposit limit is $1,000. You have deposited $${totalDeposited.toFixed(2)}. You can only deposit up to $${remaining.toFixed(2)} more.`
          : 'You have reached the maximum deposit limit of $1,000.',
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    const addressMap = {
      BTC: wallet.btcAddress,
      ETH: wallet.ethAddress,
      'USDT-TRC20': wallet.usdtTrc20Address,
      'USDT-ERC20': wallet.usdtErc20Address,
      BNB: wallet.bnbAddress,
      SOL: wallet.solAddress,
    };

    const walletAddress = addressMap[cryptoCurrency];

    const prices = {
      BTC: 67432.21,
      ETH: 3512.75,
      'USDT-TRC20': 1.00,
      'USDT-ERC20': 1.00,
      BNB: 575.45,
      SOL: 152.39,
    };

    const cryptoAmount = parseFloat(amount) / prices[cryptoCurrency];

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount: parseFloat(amount),
        cryptoAmount,
        cryptoCurrency,
        walletAddress,
        fromAddress: fromAddress || null,
        status: 'PENDING',
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        status: 'PENDING',
        amount: parseFloat(amount),
        currency: 'USD',
        cryptoAmount,
        cryptoCurrency,
        depositId: deposit.id,
        description: `Deposit of $${amount} via ${cryptoCurrency}`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Deposit initiated',
      data: {
        depositId: deposit.id,
        amount: deposit.amount,
        cryptoAmount: deposit.cryptoAmount,
        cryptoCurrency: deposit.cryptoCurrency,
        walletAddress: deposit.walletAddress,
        status: deposit.status,
        createdAt: deposit.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== UPLOAD DEPOSIT PROOF ====================

async function uploadDepositProof(req, res, next) {
  try {
    const { depositId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Proof image required',
      });
    }

    const deposit = await prisma.deposit.findFirst({
      where: { id: depositId, userId },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found',
      });
    }

    await prisma.deposit.update({
      where: { id: depositId },
      data: {
        proofImage: req.file.path,
        status: 'CONFIRMING',
      },
    });

    await prisma.transaction.updateMany({
      where: { depositId },
      data: { status: 'PROCESSING' },
    });

    res.json({
      success: true,
      message: 'Deposit proof uploaded. Awaiting confirmation.',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET MY DEPOSITS ====================

async function getMyDeposits(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.deposit.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        deposits,
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

// ==================== ADMIN: GET ALL DEPOSITS ====================

async function getAllDeposits(req, res, next) {
  try {
    const { status, userId, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
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
            },
          },
        },
      }),
      prisma.deposit.count({ where }),
    ]);

    // Get stats for the dashboard cards
    const stats = await prisma.deposit.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statusCounts = {
      PENDING: 0,
      CONFIRMING: 0,
      COMPLETED: 0,
      REJECTED: 0,
      FAILED: 0,
    };

    stats.forEach((s) => {
      statusCounts[s.status] = s._count.status;
    });

    res.json({
      success: true,
      data: {
        deposits,
        stats: statusCounts,
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

// ==================== ADMIN: CONFIRM DEPOSIT ====================

async function confirmDeposit(req, res, next) {
  try {
    const { id } = req.params;

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found',
      });
    }

    if (deposit.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Deposit already confirmed',
      });
    }

    await prisma.deposit.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        confirmedAt: new Date(),
      },
    });

    await prisma.transaction.updateMany({
      where: { depositId: id },
      data: { status: 'COMPLETED' },
    });

    // Update wallet and get new totalDeposited
    const updatedWallet = await prisma.wallet.update({
      where: { userId: deposit.userId },
      data: {
        totalBalance: { increment: deposit.amount },
        availableBalance: { increment: deposit.amount },
        totalDeposited: { increment: deposit.amount },
      },
    });

    await sendDepositEmail(
      deposit.user.email,
      deposit.user.firstName,
      deposit.amount,
      deposit.cryptoCurrency,
      'Completed'
    );

    // Check if this deposit pushed user to $4,000+ for the first time
    // Calculate previous total (before this deposit was added)
    const previousTotal = parseFloat(updatedWallet.totalDeposited) - parseFloat(deposit.amount);
    const newTotal = parseFloat(updatedWallet.totalDeposited);

    // Only send if they just crossed $4,000 threshold (were below before, now at/above)
    if (previousTotal < 4000 && newTotal >= 4000) {
      console.log(`🎯 User ${deposit.user.email} just crossed $4,000 deposit threshold!`);
      await sendPlansLockedEmail(
        deposit.user.email,
        deposit.user.firstName,
        newTotal
      );
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DEPOSIT_CONFIRMED',
        entityType: 'DEPOSIT',
        entityId: id,
        newValue: { status: 'COMPLETED', amount: deposit.amount },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'Deposit confirmed successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: REJECT DEPOSIT ====================

async function rejectDeposit(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found',
      });
    }

    if (deposit.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject a completed deposit',
      });
    }

    if (deposit.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Deposit already rejected',
      });
    }

    await prisma.deposit.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason || 'Rejected by admin',
      },
    });

    await prisma.transaction.updateMany({
      where: { depositId: id },
      data: { status: 'REJECTED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DEPOSIT_REJECTED',
        entityType: 'DEPOSIT',
        entityId: id,
        oldValue: { status: deposit.status },
        newValue: { status: 'REJECTED', reason: reason || 'Rejected by admin' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'Deposit rejected successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDepositValidation,
  getDepositAddresses,
  createDeposit,
  uploadDepositProof,
  getMyDeposits,
  getAllDeposits,
  confirmDeposit,
  rejectDeposit,
};