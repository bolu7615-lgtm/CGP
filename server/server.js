require('dotenv').config();

const app = require('./src/app');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Startup diagnostics
console.log('=== CGP Backend Starting ===');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Log errors but DON'T exit in production
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});