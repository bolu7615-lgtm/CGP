const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const kycRoutes = require('./routes/kyc.routes');
const walletRoutes = require('./routes/wallet.routes');
const depositRoutes = require('./routes/deposit.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const investmentRoutes = require('./routes/investment.routes');
const transactionRoutes = require('./routes/transaction.routes');
const adminRoutes = require('./routes/admin.routes');
const referralRoutes = require('./routes/referral.routes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS - allow localhost dev and production frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://cgp-eta.vercel.app',
    'https://capitalgrowthprogram.com/',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

// Body parsing - MUST come BEFORE rate limiters that read req.body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth rate limiter (30 per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later.',
  },
});

// General API rate limiter (200 per 15 min) - skip admin routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  skip: (req) => req.path.startsWith('/admin'),
});

// Apply general limiter to /api routes
app.use('/api', apiLimiter);

// Apply stricter auth limiter to specific auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-login-otp', authLimiter);
app.use('/api/auth/resend-verification', authLimiter);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/btc', require('./routes/btcRoutes'));

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;