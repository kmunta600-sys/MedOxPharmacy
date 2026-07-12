const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ============================================================
// GET ALL STAFF - Admin & Pharmacist
// ============================================================
router.get('/', auth, async (req, res) => {
    try {
        // Admin and Pharmacist can view staff
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist only.'
            });
        }
        
        const staff = await User.find({ 
            role: { $in: ['pharmacist', 'technician'] } 
        }).select('-password');
        
        res.json({
            success: true,
            data: staff,
            count: staff.length
        });
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching staff'
        });
    }
});

// ============================================================
// ADD STAFF - Admin & Pharmacist
// ============================================================
router.post('/', auth, async (req, res) => {
    console.log('📝 Add staff request by:', req.user.email, 'Role:', req.user.role);
    
    try {
        // Admin and Pharmacist can create staff
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist privileges required.'
            });
        }
        
        const { firstName, lastName, email, password, role, phone, address, notificationEmail } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Validate role - only allow pharmacist or technician
        if (!['pharmacist', 'technician'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be pharmacist or technician'
            });
        }

        // Create staff user
        user = new User({
            firstName,
            lastName,
            email,
            password: password,
            role: role,
            phone: phone || '',
            address: address || '',
            notificationEmail: notificationEmail || '',
            isActive: true
        });

        await user.save();
        console.log('✅ Staff added by:', req.user.email, 'Role:', req.user.role);

        res.status(201).json({
            success: true,
            message: 'Staff added successfully',
            data: {
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
        console.error('Add staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding staff: ' + error.message
        });
    }
});

// ============================================================
// UPDATE STAFF - Admin & Pharmacist
// ============================================================
router.put('/:id', auth, async (req, res) => {
    try {
        // Admin and Pharmacist can update staff
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist privileges required.'
            });
        }
        
        const { firstName, lastName, phone, address, isActive, role, notificationEmail } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        // Prevent pharmacist from changing their own role or deactivating themselves
        if (req.user.role === 'pharmacist' && user._id.toString() === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Pharmacists cannot modify their own account. Please contact Admin.'
            });
        }

        // Only admin can change roles or deactivate
        if (req.user.role === 'pharmacist') {
            // Pharmacist can update basic info but not role or status
            if (role) {
                return res.status(403).json({
                    success: false,
                    message: 'Only Admin can change roles.'
                });
            }
            if (typeof isActive === 'boolean') {
                return res.status(403).json({
                    success: false,
                    message: 'Only Admin can deactivate/activate accounts.'
                });
            }
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (typeof isActive === 'boolean' && req.user.role === 'admin') user.isActive = isActive;
        if (role && ['pharmacist', 'technician'].includes(role) && req.user.role === 'admin') user.role = role;
        if (notificationEmail) user.notificationEmail = notificationEmail;

        await user.save();

        res.json({
            success: true,
            message: 'Staff updated successfully',
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
        console.error('Update staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating staff'
        });
    }
});

// ============================================================
// DELETE STAFF - Admin & Pharmacist
// ============================================================
router.delete('/:id', auth, async (req, res) => {
    try {
        // Admin and Pharmacist can delete staff
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or Pharmacist privileges required.'
            });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Pharmacist cannot delete admin accounts
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Staff deleted successfully'
        });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting staff'
        });
    }
});

module.exports = router;
