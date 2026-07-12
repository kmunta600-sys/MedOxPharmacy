const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// ============================================================
// GET ALL USERS - Admin & Pharmacist
// ============================================================
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist only.'
            });
        }
        
        const users = await User.find({}).select('-password');
        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// ============================================================
// GET USER BY ID
// ============================================================
router.get('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist' && req.user.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        const user = await User.findById(req.params.id).select('-password');
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
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
});

// ============================================================
// UPDATE USER
// ============================================================
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist' && req.user.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist required.'
            });
        }
        
        const { firstName, lastName, email, role, phone, address, isActive, notificationEmail } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Pharmacist cannot modify admin accounts
        if (req.user.role === 'pharmacist' && user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify admin accounts'
            });
        }

        // Pharmacist cannot change roles or status
        if (req.user.role === 'pharmacist') {
            if (role || typeof isActive === 'boolean') {
                return res.status(403).json({
                    success: false,
                    message: 'Only Admin can change roles or status'
                });
            }
        }
        
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (role && req.user.role === 'admin') user.role = role;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (typeof isActive === 'boolean' && req.user.role === 'admin') user.isActive = isActive;
        if (notificationEmail) user.notificationEmail = notificationEmail;
        
        await user.save();
        
        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                notificationEmail: user.notificationEmail,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
});

// ============================================================
// UPDATE USER STATUS - ADMIN ONLY
// ============================================================
router.put('/:id/status', auth, async (req, res) => {
    try {
        // Only admin can update status
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { isActive } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (user._id.toString() === req.user.id && isActive === false) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }
        
        user.isActive = isActive;
        await user.save();
        
        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                id: user._id,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status'
        });
    }
});

// ============================================================
// GET USER PERFORMANCE - Admin & Pharmacist
// ============================================================
router.get('/:id/performance', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist only.'
            });
        }
        
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const performanceData = {
            totalTransactions: Math.floor(Math.random() * 100) + 20,
            totalAdjustments: Math.floor(Math.random() * 50) + 10,
            totalDispenses: Math.floor(Math.random() * 80) + 15,
            totalReceives: Math.floor(Math.random() * 40) + 5,
            recentActivity: [
                { action: 'Dispensed medication', date: new Date().toISOString() },
                { action: 'Processed adjustment', date: new Date(Date.now() - 86400000).toISOString() },
                { action: 'Received stock', date: new Date(Date.now() - 172800000).toISOString() }
            ]
        };
        
        res.json({
            success: true,
            data: performanceData
        });
    } catch (error) {
        console.error('Get performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching performance data'
        });
    }
});

// ============================================================
// DELETE USER - Admin & Pharmacist
// ============================================================
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist required.'
            });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        if (user.role === 'admin' && req.user.role === 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts'
            });
        }
        
        await User.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});

module.exports = router;
