const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');
const { sendInvestmentStartedEmail, sendDailyProfitEmail, sendReferralBonusEmail } = require('../utils/email');
const { generateInvestmentId } = require('../utils/generateId');

// ==================== FIXED INVESTMENT TIERS ====================

const INVESTMENT_TIERS = [
  {
    id: 'tier-1',
    name: 'Starter Plan',
    deposit: 4000,
    percentOfPlan: 10,
    dailyRoi: 2.5,
    dailyProfit: 100,
    durationDays: 60,
    totalProfit: 6000,
    totalReturn: 10000,
    minAmount: 4000,
    maxAmount: 7999,
    principalReturn: true,
    compoundInterest: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'tier-2',
    name: 'Growth Plan',
    deposit: 8000,
    percentOfPlan: 20,
    dailyRoi: 2.5,
    dailyProfit: 200,
    durationDays: 60,
    totalProfit: 12000,
    totalReturn: 20000,
    minAmount: 8000,
    maxAmount: 11999,
    principalReturn: true,
    compoundInterest: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'tier-3',
    name: 'Advanced Plan',
    deposit: 12000,
    percentOfPlan: 30,
    dailyRoi: 2.5,
    dailyProfit: 300,
    durationDays: 60,
    totalProfit: 18000,
    totalReturn: 30000,
    minAmount: 12000,
    maxAmount: 19999,
    principalReturn: true,
    compoundInterest: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'tier-4',
    name: 'Pro Plan',
    deposit: 20000,
    percentOfPlan: 50,
    dailyRoi: 2.5,
    dailyProfit: 500,
    durationDays: 60,
    totalProfit: 30000,
    totalReturn: 50000,
    minAmount: 20000,
    maxAmount: 39999,
    principalReturn: true,
    compoundInterest: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'tier-5',
    name: 'Elite Plan',
    deposit: 40000,
    percentOfPlan: 100,
    dailyRoi: 2.5,
    dailyProfit: 1000,
    durationDays: 60,
    totalProfit: 60000,
    totalReturn: 100000,
    minAmount: 40000,
    maxAmount: 40000,
    principalReturn: true,
    compoundInterest: false,
    isActive: true,
    sortOrder: 5,
  },
];

// ==================== VALIDATION ====================

const createInvestmentValidation = [
  body('planId')
    .isIn(['tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5'])
    .withMessage('Valid plan ID required'),
  body('amount')
    .isFloat({ min: 4000 })
    .withMessage('Minimum investment is $4,000'),
];

// ==================== HELPER: GET TIER BY ID ====================

function getTierById(planId) {
  return INVESTMENT_TIERS.find((t) => t.id === planId) || null;
}

// ==================== GET ALL PLANS ====================

async function getPlans(req, res, next) {
  try {
    const plansWithReturns = INVESTMENT_TIERS.map((plan) => ({
      ...plan,
      dailyProfit: parseFloat(plan.dailyProfit.toFixed(2)),
      totalProfit: parseFloat(plan.totalProfit.toFixed(2)),
      totalReturn: parseFloat(plan.totalReturn.toFixed(2)),
    }));

    res.json({
      success: true,
      data: plansWithReturns,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET PLAN BY ID ====================

async function getPlanById(req, res, next) {
  try {
    const { id } = req.params;
    const plan = getTierById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== CREATE INVESTMENT ====================

async function createInvestment(req, res, next) {
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
    const { planId, amount } = req.body;

    const tier = getTierById(planId);
    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (user.kycStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required before investing',
      });
    }

    const investAmount = parseFloat(amount);
    if (investAmount < tier.minAmount || investAmount > tier.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${tier.minAmount.toLocaleString()} and $${tier.maxAmount.toLocaleString()}`,
      });
    }

    const availableBalance = parseFloat(user.wallet.availableBalance);
    if (availableBalance < investAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance',
      });
    }

    const dailyProfit = (investAmount * tier.dailyRoi) / 100;
    const totalProfit = dailyProfit * tier.durationDays;
    const totalReturn = tier.principalReturn ? investAmount + totalProfit : totalProfit;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + tier.durationDays);

    const investment = await prisma.investment.create({
      data: {
        userId,
        planId: tier.id,
        amount: investAmount,
        dailyProfit,
        totalProfit,
        totalReturn,
        endDate,
        status: 'ACTIVE',
      },
    });

    await prisma.wallet.update({
      where: { userId },
      data: {
        availableBalance: { decrement: investAmount },
        investedBalance: { increment: investAmount },
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: 'INVESTMENT',
        status: 'COMPLETED',
        amount: investAmount,
        currency: 'USD',
        investmentId: investment.id,
        description: `Investment in ${tier.name}: $${investAmount.toLocaleString()}`,
      },
    });

    await sendInvestmentStartedEmail(
      user.email,
      user.firstName,
      investAmount,
      tier.name,
      tier.dailyRoi,
      tier.durationDays,
      totalReturn
    );

    await processReferralBonus(userId, investAmount, investment.id);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'INVESTMENT_CREATED',
        entityType: 'INVESTMENT',
        entityId: investment.id,
        newValue: { amount: investAmount, plan: tier.name, tier: tier.id },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: {
        investmentId: investment.id,
        planName: tier.name,
        amount: investment.amount,
        dailyProfit: investment.dailyProfit,
        totalProfit: investment.totalProfit,
        totalReturn: investment.totalReturn,
        startDate: investment.startDate,
        endDate: investment.endDate,
        status: investment.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET MY INVESTMENTS ====================

async function getMyInvestments(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.investment.count({ where }),
    ]);

    const investmentsWithProgress = investments.map((inv) => {
      let progress = 0;
      let daysElapsed = 0;

      if (inv.status === 'ACTIVE') {
        const now = new Date();
        const start = new Date(inv.startDate);
        const end = new Date(inv.endDate);
        const totalDuration = end - start;
        const elapsed = now - start;
        progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
        daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
      } else if (inv.status === 'COMPLETED') {
        progress = 100;
        daysElapsed = 60;
      }

      const tier = getTierById(inv.planId);

      return {
        ...inv,
        amount: parseFloat(inv.amount),
        dailyProfit: parseFloat(inv.dailyProfit),
        totalProfit: parseFloat(inv.totalProfit),
        totalReturn: parseFloat(inv.totalReturn),
        progress,
        daysElapsed,
        daysRemaining: Math.max(0, 60 - daysElapsed),
        plan: tier ? { name: tier.name, dailyRoi: tier.dailyRoi, durationDays: tier.durationDays } : null,
      };
    });

    res.json({
      success: true,
      data: {
        investments: investmentsWithProgress,
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

// ==================== GET INVESTMENT BY ID ====================

async function getInvestmentById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await prisma.investment.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          where: { type: 'PROFIT' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    const now = new Date();
    const start = new Date(investment.startDate);
    const end = new Date(investment.endDate);
    const totalDuration = end - start;
    const elapsed = now - start;
    const progress =
      investment.status === 'COMPLETED'
        ? 100
        : Math.min(100, Math.round((elapsed / totalDuration) * 100));
    const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));

    const tier = getTierById(investment.planId);

    res.json({
      success: true,
      data: {
        ...investment,
        amount: parseFloat(investment.amount),
        dailyProfit: parseFloat(investment.dailyProfit),
        totalProfit: parseFloat(investment.totalProfit),
        totalReturn: parseFloat(investment.totalReturn),
        profitsPaid: parseFloat(investment.profitsPaid || 0),
        progress,
        daysElapsed,
        daysRemaining: Math.max(0, 60 - daysElapsed),
        tierInfo: tier,
        plan: tier ? { name: tier.name, dailyRoi: tier.dailyRoi, durationDays: tier.durationDays } : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: GET ALL INVESTMENTS ====================

async function getAllInvestments(req, res, next) {
  try {
    const { status, userId, planId, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (planId) where.planId = planId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.investment.count({ where }),
    ]);

    const investmentsWithTier = investments.map((inv) => {
      const tier = getTierById(inv.planId);
      return {
        ...inv,
        plan: tier ? { name: tier.name, dailyRoi: tier.dailyRoi } : null,
      };
    });

    res.json({
      success: true,
      data: {
        investments: investmentsWithTier,
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

// ==================== PROCESS DAILY PROFITS (CRON JOB) ====================

async function processDailyProfits(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active investments
    const investments = await prisma.investment.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        user: true,
      },
    });

    let processedCount = 0;
    const errors = [];

    for (const investment of investments) {
      try {
        // Determine the reference date for calculating days due
        const referenceDate = investment.lastProfitDate
          ? new Date(investment.lastProfitDate)
          : new Date(investment.startDate);
        referenceDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - referenceDate) / (1000 * 60 * 60 * 24));

        // Skip if already processed today
        if (daysDiff <= 0) {
          continue;
        }

        // Get tier info for description
        const tier = getTierById(investment.planId);
        const planName = tier ? tier.name : 'Investment Plan';

        for (let i = 0; i < daysDiff; i++) {
          const profitDate = new Date(referenceDate);
          profitDate.setDate(profitDate.getDate() + i + 1);

          // Skip if past end date
          if (profitDate > new Date(investment.endDate)) continue;

          // Create profit transaction
          await prisma.transaction.create({
            data: {
              userId: investment.userId,
              type: 'PROFIT',
              status: 'COMPLETED',
              amount: investment.dailyProfit,
              currency: 'USD',
              investmentId: investment.id,
              description: `Daily profit from ${planName}`,
            },
          });

          // Update wallet
          await prisma.wallet.update({
            where: { userId: investment.userId },
            data: {
              totalBalance: { increment: investment.dailyProfit },
              availableBalance: { increment: investment.dailyProfit },
              totalEarnings: { increment: investment.dailyProfit },
            },
          });
        }

        // Check if investment is completed
        const isCompleted = today >= new Date(investment.endDate);
        const totalProfitPaid = parseFloat(investment.profitsPaid || 0) + (parseFloat(investment.dailyProfit) * daysDiff);

        // Update investment
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            lastProfitDate: today,
            profitsPaid: totalProfitPaid,
            profitsCount: { increment: daysDiff },
            status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          },
        });

        // If completed, return principal
        if (isCompleted) {
          await prisma.wallet.update({
            where: { userId: investment.userId },
            data: {
              totalBalance: { increment: investment.amount },
              availableBalance: { increment: investment.amount },
              investedBalance: { decrement: investment.amount },
            },
          });

          await prisma.transaction.create({
            data: {
              userId: investment.userId,
              type: 'INVESTMENT_PRINCIPAL_RETURN',
              status: 'COMPLETED',
              amount: investment.amount,
              currency: 'USD',
              investmentId: investment.id,
              description: `Principal return from ${planName}`,
            },
          });
        }

        // Send daily profit email
        if (investment.user.emailNotifications) {
          await sendDailyProfitEmail(
            investment.user.email,
            investment.user.firstName,
            investment.dailyProfit,
            planName,
            investment.amount
          );
        }

        processedCount++;
      } catch (err) {
        errors.push({ investmentId: investment.id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${processedCount} investments`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== REFERRAL BONUS HELPER ====================

async function processReferralBonus(userId, amount, investmentId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { referredBy: true },
    });

    if (!user.referredBy) return;

    const levels = [
      { level: 1, percent: 5 },
      { level: 2, percent: 2 },
      { level: 3, percent: 1 },
    ];

    let currentReferrer = user.referredBy;

    for (const { level, percent } of levels) {
      if (!currentReferrer) break;

      const bonusAmount = (parseFloat(amount) * percent) / 100;

      await prisma.referralEarning.create({
        data: {
          userId: currentReferrer.id,
          referredUserId: userId,
          level,
          amount: bonusAmount,
          percentage: percent,
          sourceType: 'INVESTMENT',
          sourceId: investmentId,
        },
      });

      await prisma.wallet.update({
        where: { userId: currentReferrer.id },
        data: {
          totalBalance: { increment: bonusAmount },
          availableBalance: { increment: bonusAmount },
          totalEarnings: { increment: bonusAmount },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: currentReferrer.id,
          type: 'REFERRAL_BONUS',
          status: 'COMPLETED',
          amount: bonusAmount,
          currency: 'USD',
          description: `Level ${level} referral bonus from ${user.firstName} ${user.lastName}`,
        },
      });

      if (currentReferrer.emailNotifications) {
        await sendReferralBonusEmail(
          currentReferrer.email,
          currentReferrer.firstName,
          bonusAmount,
          level,
          `${user.firstName} ${user.lastName}`
        );
      }

      const nextReferrer = await prisma.user.findUnique({
        where: { id: currentReferrer.referredById },
      });
      currentReferrer = nextReferrer;
    }
  } catch (error) {
    console.error('Referral bonus error:', error);
  }
}

module.exports = {
  INVESTMENT_TIERS,
  createInvestmentValidation,
  getPlans,
  getPlanById,
  createInvestment,
  getMyInvestments,
  getInvestmentById,
  getAllInvestments,
  processDailyProfits,
  processReferralBonus,
};