const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ============================================================
// VALIDATION RULES
// ============================================================
const registerValidation = [
    body('firstName').notEmpty().withMessage('First name is required').trim(),
    body('lastName').notEmpty().withMessage('Last name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'pharmacist', 'technician', 'viewer'])
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

// ============================================================
// ROUTES
// ============================================================
// Register user
router.post('/register', registerValidation, register);

// Login user
router.post('/login', loginValidation, login);

// Get current user (protected)
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logout);

module.exports = router;
