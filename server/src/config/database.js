const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
  });
} catch (err) {
  console.error('Prisma initialization failed:', err.message);
  // Create a stub so the app can start and report the error via HTTP
  prisma = {
    $connect: () => Promise.reject(new Error('Prisma not initialized: ' + err.message)),
    $disconnect: () => Promise.resolve(),
    user: { findUnique: () => Promise.reject(new Error('DB not connected')) },
    // ... add other model stubs as needed, or just let errors bubble
  };
}

module.exports = prisma;