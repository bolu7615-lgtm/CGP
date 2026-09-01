const prisma = require('../config/database');

// ==================== GET TRANSACTION STATS ====================

async function getStats(req, res, next) {
  try {
    const userId = req.user.id;

    const [
      totalDeposits,
      totalWithdrawals,
      totalInvestments,
      totalProfits,
      totalReferralBonuses,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'WITHDRAWAL', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'INVESTMENT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'PROFIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'REFERRAL_BONUS', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        totalInvestments: totalInvestments._sum.amount || 0,
        totalProfits: totalProfits._sum.amount || 0,
        totalReferralBonuses: totalReferralBonuses._sum.amount || 0,
        netProfit: (totalProfits._sum.amount || 0) + (totalReferralBonuses._sum.amount || 0),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: GET ALL TRANSACTIONS ====================

async function getAllTransactions(req, res, next) {
  try {
    const { type, status, userId, page = 1, limit = 50 } = req.query;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
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

// ==================== ADMIN: GET PLATFORM STATS ====================

async function getPlatformStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalActiveUsers,
      totalInvestments,
      activeInvestments,
      totalDeposits,
      totalWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      pendingKyc,
      totalReferralEarnings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true, isBanned: false } }),
      prisma.investment.count(),
      prisma.investment.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { kycStatus: 'SUBMITTED' } }),
      prisma.referralEarning.aggregate({
        _sum: { amount: true },
      }),
    ]);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayDeposits, todayWithdrawals, todayRegistrations, todayInvestments] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: 'DEPOSIT',
          status: 'COMPLETED',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.investment.count({ where: { createdAt: { gte: today } } }),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: totalActiveUsers,
          todayRegistrations,
        },
        investments: {
          total: totalInvestments,
          active: activeInvestments,
          today: todayInvestments,
        },
        deposits: {
          total: totalDeposits._sum.amount || 0,
          today: todayDeposits._sum.amount || 0,
          pending: pendingDeposits,
        },
        withdrawals: {
          total: totalWithdrawals._sum.amount || 0,
          today: todayWithdrawals._sum.amount || 0,
          pending: pendingWithdrawals,
        },
        kyc: {
          pending: pendingKyc,
        },
        referralEarnings: totalReferralEarnings._sum.amount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getAllTransactions,
  getPlatformStats,
};