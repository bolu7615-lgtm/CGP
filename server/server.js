require('dotenv').config();

const app = require('./src/app');
const prisma = require('./src/config/database');

// Only start the HTTP server in local development
// Vercel serverless handles the HTTP layer itself
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🚀 Capital Growth Program (CGP) Backend                 ║
║                                                              ║
║     Server running on port ${PORT}                            ║
║     Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Server closed. Database disconnected.');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Server closed. Database disconnected.');
      process.exit(0);
    });
  });
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// CRITICAL: Export for Vercel serverless
module.exports = app;