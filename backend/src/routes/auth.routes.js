
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/update-password', authController.updatePassword);

// Super Admin creation
router.post('/create-super-admin', authController.createSuperAdmin);

// Admin verification
router.get('/verify-admin', authController.verifyAdmin);

// Profile routes - make sure these handle string IDs properly
router.get('/profile/:id', authenticate, authController.getProfile);
router.put('/profile/:id', authenticate, authController.updateProfile);

module.exports = router;
