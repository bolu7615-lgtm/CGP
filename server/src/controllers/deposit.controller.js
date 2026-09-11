const cron = require('node-cron');
const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');
const {
  sendDepositEmail,
  sendPlansLockedEmail,
  sendMonthlyDepositReminderEmail,
} = require('../utils/email');
const { generateDepositId } = require('../utils/generateId');

// ==================== HELPERS ====================

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.ip
    || req.connection?.remoteAddress
    || 'unknown';
};

const getUserAgent = (req) => {
  return (req.headers['user-agent'] || 'unknown').substring(0, 200);
};

/**
 * Get start of today in UTC (consistent for all users)
 */
function getTodayStartUTC() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
}

// ==================== VALIDATION ====================

const createDepositValidation = [
  body('amount')
    .isFloat({ min: 50, max: 1000 })
    .withMessage('Deposit amount must be between $50 and $1,000'),
  body('cryptoCurrency')
    .isIn(['BTC', 'ETH', 'USDT-TRC20', 'USDT-ERC20', 'BNB', 'SOL']),
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
    const depositAmount = parseFloat(amount);
    const todayStart = getTodayStartUTC();

    // Use a transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Lock and get today's deposits sum
      const todayDeposits = await tx.deposit.aggregate({
        where: {
          userId,
          status: { in: ['PENDING', 'CONFIRMING', 'COMPLETED'] },
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true },
      });

      const totalDepositedToday = parseFloat(todayDeposits._sum.amount || 0);
      const newTotalToday = totalDepositedToday + depositAmount;

      if (newTotalToday > 1000) {
        const remaining = Math.max(0, 1000 - totalDepositedToday);
        throw new Error(JSON.stringify({
          status: 400,
          message: remaining > 0
            ? `Daily deposit limit is $1,000. You have deposited $${totalDepositedToday.toFixed(2)} today. You can only deposit up to $${remaining.toFixed(2)} more today.`
            : 'You have reached the daily deposit limit of $1,000. Try again after midnight UTC.',
        }));
      }

      const wallet = await tx.wallet.findUnique({
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

      const cryptoAmount = depositAmount / prices[cryptoCurrency];

      const deposit = await tx.deposit.create({
        data: {
          userId,
          amount: depositAmount,
          cryptoAmount,
          cryptoCurrency,
          walletAddress,
          fromAddress: fromAddress || null,
          status: 'PENDING',
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          status: 'PENDING',
          amount: depositAmount,
          currency: 'USD',
          cryptoAmount,
          cryptoCurrency,
          depositId: deposit.id,
          description: `Deposit of $${amount} via ${cryptoCurrency}`,
        },
      });

      return deposit;
    });

    res.status(201).json({
      success: true,
      message: 'Deposit initiated',
      data: {
        depositId: result.id,
        amount: result.amount,
        cryptoAmount: result.cryptoAmount,
        cryptoCurrency: result.cryptoCurrency,
        walletAddress: result.walletAddress,
        status: result.status,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    // Handle custom error from transaction
    try {
      const errData = JSON.parse(error.message);
      if (errData.status && errData.message) {
        return res.status(errData.status).json({
          success: false,
          message: errData.message,
        });
      }
    } catch {}
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

    const previousTotal = parseFloat(updatedWallet.totalDeposited) - parseFloat(deposit.amount);
    const newTotal = parseFloat(updatedWallet.totalDeposited);

    if (previousTotal < 4000 && newTotal >= 4000) {
      console.log(`User ${deposit.user.email} just crossed $4,000 deposit threshold!`);
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
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
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
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
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

// ==================== ⭐ MONTHLY $4K DEPOSIT REMINDER CRON ====================

const MONTHLY_DEPOSIT_TARGET = 4000;
const REMINDER_DAYS_BEFORE_MONTH_END = 5; // start reminding when 5 days remain until month end

// In-memory guard so a user never gets 2 reminders on the same day
// (resets automatically each server restart — safe to duplicate occasionally)
const remindersSentToday = new Set();

/**
 * Send daily reminder emails to users whose MONTHLY deposits
 * are below $4,000. Runs only during the LAST 5 DAYS of the month.
 *
 * Example (September, 30 days): runs Sep 25, 26, 27, 28, 29, 30
 * Example (February, 28 days):  runs Feb 23, 24, 25, 26, 27, 28
 */
async function sendMonthlyDepositReminders() {
  try {
    const now = new Date();
    const day = now.getUTCDate();
    const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
    const daysLeft = daysInMonth - day; // 0 = today is the last day of the month

    // Only run when 5 days or fewer remain until month end
    if (daysLeft > REMINDER_DAYS_BEFORE_MONTH_END) {
      return;
    }

    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    const todayKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${day}`;

    console.log(`📅 Running month-end deposit reminder check for ${monthName} (day ${day}/${daysInMonth}, ${daysLeft} day(s) left)...`);

    // Sum COMPLETED deposits per user for this month
    const monthlyDeposits = await prisma.deposit.groupBy({
      by: ['userId'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    // Build a map: userId -> total deposited this month
    const depositedMap = new Map();
    monthlyDeposits.forEach((d) => {
      depositedMap.set(d.userId, parseFloat(d._sum.amount || 0));
    });

    // Get all users (adjust the `where` filter to match your User model)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        // If your User model has a status field, uncomment:
        // status: true,
      },
      // where: { status: 'ACTIVE' },
    });

    let sent = 0;
    let skipped = 0;

    for (const user of users) {
      const totalThisMonth = depositedMap.get(user.id) || 0;

      // Already hit the $4K monthly target — no reminder needed
      if (totalThisMonth >= MONTHLY_DEPOSIT_TARGET) {
        skipped++;
        continue;
      }

      // Already reminded today — skip
      if (remindersSentToday.has(`${user.id}-${todayKey}`)) {
        skipped++;
        continue;
      }

      const remaining = MONTHLY_DEPOSIT_TARGET - totalThisMonth;
      const firstName = user.firstName || 'Investor';

      const result = await sendMonthlyDepositReminderEmail(
        user.email,
        firstName,
        totalThisMonth,
        remaining,
        daysLeft,
        monthName
      );

      if (result.success) {
        remindersSentToday.add(`${user.id}-${todayKey}`);
        sent++;
      }
    }

    // Prune old keys from the set to keep memory small
    if (remindersSentToday.size > 5000) {
      for (const key of remindersSentToday) {
        if (!key.endsWith(todayKey)) remindersSentToday.delete(key);
      }
    }

    console.log(`✅ Month-end deposit reminders complete: ${sent} sent, ${skipped} skipped (met target or already reminded).`);
  } catch (error) {
    console.error('❌ Month-end deposit reminder cron failed:', error.message);
  }
}

/**
 * Start the daily reminder cron job.
 * CALL THIS ONCE from your server entry file (e.g. server.js / index.js):
 *
 *   const { startMonthlyDepositReminderCron } = require('./controllers/depositController');
 *   startMonthlyDepositReminderCron();
 */
function startMonthlyDepositReminderCron() {
  // Run every day at 08:00 UTC — the days-remaining check happens inside
  cron.schedule('0 8 * * *', sendMonthlyDepositReminders, {
    timezone: 'UTC',
  });
  console.log(`⏰ Month-end deposit reminder cron scheduled (daily at 08:00 UTC, active during last ${REMINDER_DAYS_BEFORE_MONTH_END} days of each month).`);
}

// Optional: manual trigger for testing via admin route or CLI
async function triggerMonthlyDepositRemindersNow() {
  console.log('⚡ Manual trigger: sending month-end deposit reminders now...');
  await sendMonthlyDepositReminders();
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
  // ⭐ New exports
  startMonthlyDepositReminderCron,
  sendMonthlyDepositReminders,
  triggerMonthlyDepositRemindersNow,
};