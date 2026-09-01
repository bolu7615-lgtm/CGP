const prisma = require('../config/database');
const { generateToken } = require('../utils/crypto');

// ==================== GET WALLET ====================

async function getWallet(req, res, next) {
  try {
    const userId = req.user.id;

    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    // Auto-create wallet if it doesn't exist (for seeded users or old accounts)
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          btcAddress: `bc1${generateToken(20)}`,
          ethAddress: `0x${generateToken(20)}`,
          usdtTrc20Address: `T${generateToken(20)}`,
          usdtErc20Address: `0x${generateToken(20)}`,
          bnbAddress: `0x${generateToken(20)}`,
          solAddress: generateToken(22),
        },
      });
    }

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        cryptoAmount: true,
        cryptoCurrency: true,
        description: true,
        createdAt: true,
      },
    });

    // Get active investments summary
    const activeInvestments = await prisma.investment.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: {
          select: { name: true, dailyRoi: true },
        },
      },
    });

    const totalDailyProfit = activeInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.dailyProfit || 0),
      0
    );

    res.json({
      success: true,
      data: {
        wallet: {
          totalBalance: wallet.totalBalance,
          availableBalance: wallet.availableBalance,
          investedBalance: wallet.investedBalance,
          totalEarnings: wallet.totalEarnings,
          totalDeposited: wallet.totalDeposited,
          totalWithdrawn: wallet.totalWithdrawn,
        },
        addresses: {
          BTC: wallet.btcAddress,
          ETH: wallet.ethAddress,
          'USDT-TRC20': wallet.usdtTrc20Address,
          'USDT-ERC20': wallet.usdtErc20Address,
          BNB: wallet.bnbAddress,
          SOL: wallet.solAddress,
        },
        stats: {
          activeInvestments: activeInvestments.length,
          totalDailyProfit,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET TRANSACTIONS ====================

async function getTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const { type, status, page = 1, limit = 20, startDate, endDate } = req.query;

    const where = { userId };

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          investment: {
            select: {
              plan: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
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

// ==================== GET TRANSACTION BY ID ====================

async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        investment: {
          include: {
            plan: {
              select: { name: true, dailyRoi: true, durationDays: true },
            },
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET EARNINGS HISTORY ====================

async function getEarningsHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // '7', '30', '90', '365' days

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all profit transactions within the period
    const profits = await prisma.transaction.findMany({
      where: {
        userId,
        type: { in: ['PROFIT', 'REFERRAL_BONUS'] },
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        amount: true,
        type: true,
        createdAt: true,
      },
    });

    // Group by date and sum earnings
    const earningsMap = new Map();

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      earningsMap.set(dateKey, { name: label, earnings: 0, date: dateKey });
    }

    // Add actual profits
    for (const profit of profits) {
      const dateKey = new Date(profit.createdAt).toISOString().split('T')[0];
      if (earningsMap.has(dateKey)) {
        const entry = earningsMap.get(dateKey);
        entry.earnings += parseFloat(profit.amount);
      }
    }

    // Convert to array and format
    const earningsData = Array.from(earningsMap.values()).map((item) => ({
      name: item.name,
      earnings: parseFloat(item.earnings.toFixed(2)),
    }));

    // Also get summary stats
    const totalEarnings = earningsData.reduce((sum, d) => sum + d.earnings, 0);
    const avgDaily = totalEarnings / days;

    res.json({
      success: true,
      data: {
        earnings: earningsData,
        summary: {
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          avgDaily: parseFloat(avgDaily.toFixed(2)),
          period: days,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWallet,
  getTransactions,
  getTransactionById,
  getEarningsHistory,
};