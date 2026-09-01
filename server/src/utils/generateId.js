const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique transaction ID (e.g., CGP-DEP-20240824-XXXXX)
 */
function generateTransactionId(prefix = 'TXN') {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CGP-${prefix}-${date}-${random}`;
}

/**
 * Generate a deposit ID
 */
function generateDepositId() {
  return generateTransactionId('DEP');
}

/**
 * Generate a withdrawal ID
 */
function generateWithdrawalId() {
  return generateTransactionId('WTH');
}

/**
 * Generate an investment ID
 */
function generateInvestmentId() {
  return generateTransactionId('INV');
}

/**
 * Generate a referral code (short, shareable)
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = 'CGP-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a KYC submission ID
 */
function generateKycId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KYC-${date}-${random}`;
}

/**
 * Generate a support ticket ID
 */
function generateTicketId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${date}-${random}`;
}

/**
 * Generate a unique wallet address (mock - in production, use actual blockchain APIs)
 */
function generateWalletAddress(crypto) {
  const prefixes = {
    BTC: ['1', '3', 'bc1'],
    ETH: ['0x'],
    USDT_TRC20: ['T'],
    USDT_ERC20: ['0x'],
    BNB: ['bnb', '0x'],
    SOL: [''],
  };

  const prefix = prefixes[crypto] ? prefixes[crypto][0] : '';
  const randomHex = Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return prefix + randomHex;
}

/**
 * Generate a UUID
 */
function generateUUID() {
  return uuidv4();
}

/**
 * Generate a short ID (for URLs, etc.)
 */
function generateShortId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  generateTransactionId,
  generateDepositId,
  generateWithdrawalId,
  generateInvestmentId,
  generateReferralCode,
  generateKycId,
  generateTicketId,
  generateWalletAddress,
  generateUUID,
  generateShortId,
};