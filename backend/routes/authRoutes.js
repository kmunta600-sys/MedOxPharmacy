const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendResetEmail } = require('../services/passwordResetService');

// ============================================================
// REGISTER
// ============================================================
router.post('/register', async (req, res) => {
    console.log('📝 Register request:', req.body.email);

    try {
        const { firstName, lastName, email, password, role, phone, address, notificationEmail } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        user = new User({
            firstName: firstName || 'Demo',
            lastName: lastName || 'User',
            email,
            password: password,
            role: role || 'admin',
            phone: phone || '',
            address: address || '',
            notificationEmail: notificationEmail || '',
            isActive: true
        });

        await user.save();
        console.log('✅ User registered:', email);

        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'medoxpharmacysecretkey2024', {
            expiresIn: '7d'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone || '',
                notificationEmail: user.notificationEmail || '',
                address: user.address || ''
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// ============================================================
// LOGIN
// ============================================================
router.post('/login', async (req, res) => {
    console.log('🔑 Login request:', req.body.email);

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (user.isActive === false) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        console.log('✅ User found:', email);
        console.log('   Role:', user.role);

        const isMatch = await user.comparePassword(password);
        console.log('   Password match:', isMatch);

        if (!isMatch) {
            console.log('❌ Password does not match');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'medoxpharmacysecretkey2024', {
            expiresIn: '7d'
        });

        console.log('✅ Login successful:', email);

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone || '',
                notificationEmail: user.notificationEmail || ''
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// ============================================================
// CHANGE PASSWORD
// ============================================================
router.post('/change-password', async (req, res) => {
    console.log('🔑 Change password request');

    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medoxpharmacysecretkey2024');
        const userId = decoded.id;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        console.log('✅ Password changed for user:', user.email);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password: ' + error.message
        });
    }
});

// ============================================================
// UPDATE PROFILE
// ============================================================
router.put('/profile', async (req, res) => {
    console.log('📝 Update profile request');

    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medoxpharmacysecretkey2024');
        const userId = decoded.id;

        const { firstName, lastName, phone, email, notificationEmail } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (notificationEmail) user.notificationEmail = notificationEmail;

        await user.save();

        console.log('✅ Profile updated for user:', user.email);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                notificationEmail: user.notificationEmail
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile: ' + error.message
        });
    }
});

// ============================================================
// GET PROFILE
// ============================================================
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medoxpharmacysecretkey2024');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// ============================================================
// GET CURRENT USER
// ============================================================
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medoxpharmacysecretkey2024');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// ============================================================
// FORGOT PASSWORD
// ============================================================
router.post('/forgot-password', async (req, res) => {
    console.log('🔑 Forgot password request:', req.body.email);

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Search by both email and notificationEmail
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { notificationEmail: email.toLowerCase().trim() }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Use notificationEmail if available, otherwise use the login email
        const sendToEmail = user.notificationEmail || user.email;
        console.log('📧 Sending reset email to:', sendToEmail);

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');

        // Save token to user
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();

        // Send real email
        const emailResult = await sendResetEmail(sendToEmail, token);

        if (emailResult.success) {
            console.log('✅ Password reset email sent to:', sendToEmail);
            res.json({
                success: true,
                message: 'Password reset instructions sent to your email'
            });
        } else {
            console.error('❌ Email send failed:', emailResult.error);
            res.json({
                success: true,
                message: 'Password reset instructions sent to your email',
                note: 'Check your spam folder or contact support'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request: ' + error.message
        });
    }
});

// ============================================================
// RESET PASSWORD
// ============================================================
router.post('/reset-password', async (req, res) => {
    console.log('🔑 Reset password request');

    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log('✅ Password reset successful for:', user.email);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password: ' + error.message
        });
    }
});

// ============================================================
// VALIDATE RESET TOKEN
// ============================================================
router.get('/validate-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            email: user.email
        });

    } catch (error) {
        console.error('Validate token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating token'
        });
    }
});

module.exports = router;
