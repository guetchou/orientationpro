const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, roleGuard } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/update-password', authController.updatePassword);

// Super Admin creation (admin/superadmin only)
router.post('/create-super-admin', authenticate, roleGuard(['admin', 'superadmin']), authController.createSuperAdmin);

// Admin verification (admin/superadmin only)
router.get('/verify-admin', authenticate, roleGuard(['admin', 'superadmin']), authController.verifyAdmin);

// Profile routes - owner or admin/superadmin
router.get('/profile/:id', authenticate, authController.getProfile);
router.put('/profile/:id', authenticate, authController.updateProfile);

module.exports = router;
