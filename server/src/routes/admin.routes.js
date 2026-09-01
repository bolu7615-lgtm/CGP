const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin, requireSuperAdmin } = require('../middleware/admin.middleware');

// ─── DASHBOARD STATS (NEW) ────────────────────────────────────────
router.get('/platform-stats', requireAdmin, adminController.getPlatformStats);
router.get('/weekly-stats', requireAdmin, adminController.getWeeklyStats);
router.get('/user-growth', requireAdmin, adminController.getUserGrowth);
router.get('/recent-activity', requireAdmin, adminController.getRecentActivity);

// User management
router.get('/users', requireAdmin, adminController.getAllUsers);
router.get('/users/:userId', requireAdmin, adminController.getUserById);
router.put('/users/:userId', requireAdmin, adminController.updateUser);
router.post('/users/:userId/balance', requireAdmin, adminController.adjustBalance);

// Audit logs
router.get('/audit-logs', requireAdmin, adminController.getAuditLogs);

// Settings
router.get('/settings', requireAdmin, adminController.getSettings);
router.put('/settings/:key', requireSuperAdmin, adminController.updateSetting);

// Email templates
router.get('/email-templates', requireAdmin, adminController.getEmailTemplates);
router.put('/email-templates/:id', requireSuperAdmin, adminController.updateEmailTemplate);

module.exports = router;