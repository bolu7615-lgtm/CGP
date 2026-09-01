const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== ADMIN USER ====================

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cgp.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      kycStatus: 'APPROVED',
      kycVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // ==================== INVESTMENT PLANS (NEW 5-TIER STRUCTURE) ====================

  // Clear old plans first to avoid slug conflicts
  await prisma.investmentPlan.deleteMany();
  console.log('🗑️ Cleared old investment plans');

  const plans = [
    {
      id: 'tier-1',
      name: 'Starter Plan',
      slug: 'starter',
      description: '10% of plan. $4,000 deposit earning $100/day for 60 days. 150% total ROI with principal return.',
      dailyRoi: 2.50,
      durationDays: 60,
      minAmount: 4000.00,
      maxAmount: 7999.99,
      principalReturn: true,
      compoundInterest: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'tier-2',
      name: 'Growth Plan',
      slug: 'growth',
      description: '20% of plan. $8,000 deposit earning $200/day for 60 days. 150% total ROI with principal return.',
      dailyRoi: 2.50,
      durationDays: 60,
      minAmount: 8000.00,
      maxAmount: 11999.99,
      principalReturn: true,
      compoundInterest: false,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'tier-3',
      name: 'Advanced Plan',
      slug: 'advanced',
      description: '30% of plan. $12,000 deposit earning $300/day for 60 days. 150% total ROI with principal return.',
      dailyRoi: 2.50,
      durationDays: 60,
      minAmount: 12000.00,
      maxAmount: 19999.99,
      principalReturn: true,
      compoundInterest: false,
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'tier-4',
      name: 'Pro Plan',
      slug: 'pro',
      description: '50% of plan. $20,000 deposit earning $500/day for 60 days. 150% total ROI with principal return.',
      dailyRoi: 2.50,
      durationDays: 60,
      minAmount: 20000.00,
      maxAmount: 39999.99,
      principalReturn: true,
      compoundInterest: false,
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'tier-5',
      name: 'Elite Plan',
      slug: 'elite',
      description: '100% of plan. $40,000 deposit earning $1,000/day for 60 days. 150% total ROI with principal return.',
      dailyRoi: 2.50,
      durationDays: 60,
      minAmount: 40000.00,
      maxAmount: 40000.00,
      principalReturn: true,
      compoundInterest: false,
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.create({
      data: plan,
    });
    console.log(`✅ Plan created: ${plan.name} — $${plan.minAmount.toLocaleString()} (${plan.durationDays} days @ ${plan.dailyRoi}% daily)`);
  }

  // ==================== EMAIL TEMPLATES ====================

  const templates = [
    {
      name: 'WELCOME',
      subject: 'Welcome to Capital Growth Program!',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623; margin: 0;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px; background: #fff;">' +
        '    <h2>Welcome, {{firstName}}!</h2>' +
        '    <p>Thank you for joining Capital Growth Program. Your journey to financial growth starts now.</p>' +
        '    <p>Please verify your email by using this code: <strong style="color: #F5A623; font-size: 24px;">{{code}}</strong></p>' +
        '    <p>This code expires in 15 minutes.</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'code'],
    },
    {
      name: 'LOGIN_OTP',
      subject: 'Your Login Verification Code - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>Login Verification</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>Your login verification code is:</p>' +
        '    <div style="background: #0B0E14; color: #F5A623; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; border-radius: 8px; margin: 20px 0;">' +
        '      {{code}}' +
        '    </div>' +
        '    <p>This code expires in 10 minutes. If you did not request this, please secure your account immediately.</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'code'],
    },
    {
      name: 'DEPOSIT_RECEIVED',
      subject: 'Deposit Received - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>Deposit Received</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>We have received your deposit of <strong>${{amount}}</strong> in {{cryptoCurrency}}.</p>' +
        '    <p>Status: <span style="color: #22c55e;">{{status}}</span></p>' +
        '    <p>Your balance will be updated shortly.</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'amount', 'cryptoCurrency', 'status'],
    },
    {
      name: 'WITHDRAWAL_PROCESSED',
      subject: 'Withdrawal Processed - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>Withdrawal Processed</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>Your withdrawal of <strong>${{amount}}</strong> {{cryptoCurrency}} has been processed.</p>' +
        '    <p>Transaction Hash: {{txHash}}</p>' +
        '    <p>Sent to: {{walletAddress}}</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'amount', 'cryptoCurrency', 'txHash', 'walletAddress'],
    },
    {
      name: 'KYC_APPROVED',
      subject: 'Identity Verification Approved - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>🎉 Verification Approved!</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>Your identity verification (KYC) has been <strong style="color: #22c55e;">approved</strong>.</p>' +
        '    <p>You now have full access to all platform features including withdrawals and investments.</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName'],
    },
    {
      name: 'KYC_REJECTED',
      subject: 'Identity Verification Needs Attention - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>Verification Update</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>Your identity verification (KYC) was <strong style="color: #ef4444;">rejected</strong>.</p>' +
        '    <p><strong>Reason:</strong> {{reason}}</p>' +
        '    <p>Please resubmit your documents with the required corrections.</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'reason'],
    },
    {
      name: 'DAILY_PROFIT',
      subject: 'Daily Profit Credited - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>💰 Daily Profit Credited</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>Your daily profit of <strong>${{amount}}</strong> has been credited to your wallet.</p>' +
        '    <p>Plan: {{planName}}</p>' +
        '    <p>Investment: ${{investmentAmount}}</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'amount', 'planName', 'investmentAmount'],
    },
    {
      name: 'INVESTMENT_STARTED',
      subject: 'Investment Started - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>Investment Confirmed</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>Your investment of <strong>${{amount}}</strong> in the <strong>{{planName}}</strong> is now active.</p>' +
        '    <p>Daily ROI: {{dailyRoi}}%</p>' +
        '    <p>Duration: {{durationDays}} days</p>' +
        '    <p>Expected Return: ${{expectedReturn}}</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'amount', 'planName', 'dailyRoi', 'durationDays', 'expectedReturn'],
    },
    {
      name: 'REFERRAL_BONUS',
      subject: 'Referral Bonus Earned - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>🎉 Referral Bonus!</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>You earned <strong>${{amount}}</strong> from your Level {{level}} referral.</p>' +
        '    <p>Referred User: {{referredUserName}}</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'amount', 'level', 'referredUserName'],
    },
    {
      name: 'PASSWORD_CHANGED',
      subject: 'Password Changed - CGP',
      body: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '  <div style="background: #0B0E14; padding: 30px; text-align: center;">' +
        '    <h1 style="color: #F5A623;">Capital Growth Program</h1>' +
        '  </div>' +
        '  <div style="padding: 30px;">' +
        '    <h2>Security Alert</h2>' +
        '    <p>Hi {{firstName}},</p>' +
        '    <p>Your password was changed on {{date}}.</p>' +
        '    <p>If you did not make this change, please contact support immediately.</p>' +
        '  </div>' +
        '</body>' +
        '</html>',
      variables: ['firstName', 'date'],
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
    console.log(`✅ Email template created: ${template.name}`);
  }

  // ==================== SITE SETTINGS ====================

  const settings = [
    { key: 'SITE_NAME', value: 'Capital Growth Program', description: 'Platform name' },
    { key: 'SITE_URL', value: 'https://capitalgrowthprogram.com', description: 'Platform URL' },
    { key: 'MIN_WITHDRAWAL', value: '100', description: 'Minimum withdrawal amount in USD' },
    { key: 'WITHDRAWAL_FEE', value: '2', description: 'Withdrawal fee percentage' },
    { key: 'REFERRAL_LEVEL_1', value: '5', description: 'Level 1 referral commission %' },
    { key: 'REFERRAL_LEVEL_2', value: '2', description: 'Level 2 referral commission %' },
    { key: 'REFERRAL_LEVEL_3', value: '1', description: 'Level 3 referral commission %' },
    { key: 'MAINTENANCE_MODE', value: 'false', description: 'Site maintenance mode' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }

  console.log('✅ Site settings created');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });