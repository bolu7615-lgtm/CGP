const prisma = require('../config/database');

// ==================== GET REFERRAL LEADERBOARD ====================

async function getLeaderboard(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with referral stats
    const users = await prisma.user.findMany({
      where: {
        referrals: { some: {} },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        referralCode: true,
        _count: {
          select: { referrals: true },
        },
        referralEarnings: {
          select: { amount: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats and sort
    const leaderboard = users.map((user) => {
      const totalEarnings = user.referralEarnings.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0
      );
      const level1Count = user.referralEarnings.filter((e) => e.level === 1).length;
      const level2Count = user.referralEarnings.filter((e) => e.level === 2).length;
      const level3Count = user.referralEarnings.filter((e) => e.level === 3).length;

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        country: user.country,
        totalReferrals: user._count.referrals,
        totalEarnings,
        level1Count,
        level2Count,
        level3Count,
      };
    });

    // Sort by total earnings desc
    leaderboard.sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Add rank
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    const paginated = ranked.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        leaderboard: paginated,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: leaderboard.length,
          totalPages: Math.ceil(leaderboard.length / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET MY REFERRAL STATS ====================

async function getMyReferralStats(req, res, next) {
  try {
    const userId = req.user.id;

    const [
      referrals,
      earnings,
      referralSettings,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { referredById: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          kycStatus: true,
          _count: { select: { investments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.referralEarning.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.siteSetting.findMany({
        where: {
          key: { in: ['REFERRAL_LEVEL_1', 'REFERRAL_LEVEL_2', 'REFERRAL_LEVEL_3'] },
        },
      }),
    ]);

    const totalEarned = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const level1Earnings = earnings.filter((e) => e.level === 1).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const level2Earnings = earnings.filter((e) => e.level === 2).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const level3Earnings = earnings.filter((e) => e.level === 3).reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const rates = {};
    referralSettings.forEach((s) => {
      rates[s.key] = parseFloat(s.value);
    });

    res.json({
      success: true,
      data: {
        referralCode: req.user.referralCode,
        referralLink: `${process.env.FRONTEND_URL}/register?ref=${req.user.referralCode}`,
        totalReferrals: referrals.length,
        totalEarned,
        levelBreakdown: {
          level1: { count: referrals.length, earnings: level1Earnings, rate: rates.REFERRAL_LEVEL_1 || 5 },
          level2: { earnings: level2Earnings, rate: rates.REFERRAL_LEVEL_2 || 2 },
          level3: { earnings: level3Earnings, rate: rates.REFERRAL_LEVEL_3 || 1 },
        },
        referrals,
        recentEarnings: earnings.slice(0, 20),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLeaderboard,
  getMyReferralStats,
};