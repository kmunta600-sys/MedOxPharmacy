const User = require('../models/User');
const bcrypt = require('bcryptjs');
const StockCard = require('../models/StockCard');

// ============================================================
// GET ALL USERS
// ============================================================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// ============================================================
// GET USER BY ID
// ============================================================
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        
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
};

// ============================================================
// CREATE USER (Register)
// ============================================================
exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone, address } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'Pharmacist',
            phone: phone || '',
            address: address || '',
            isActive: true
        });
        
        await user.save();
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user: ' + error.message
        });
    }
};

// ============================================================
// UPDATE USER
// ============================================================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role, phone, address, isActive } = req.body;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (role) user.role = role;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (isActive !== undefined) user.isActive = isActive;
        
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
};

// ============================================================
// UPDATE USER STATUS
// ============================================================
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status'
        });
    }
};

// ============================================================
// DELETE USER
// ============================================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting yourself
        if (id === req.user?.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }
        
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
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
};

// ============================================================
// CHANGE PASSWORD
// ============================================================
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
};

// ============================================================
// UPDATE PROFILE
// ============================================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, email, phone } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// ============================================================
// GET STAFF PERFORMANCE
// ============================================================
exports.getStaffPerformance = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get performance metrics from StockCard
        const transactions = await StockCard.find({
            transactingOfficer: user.firstName + ' ' + user.lastName
        });
        
        const totalTransactions = transactions.length;
        const totalAdjustments = transactions.filter(t => 
            t.transactionType === 'adjustment-positive' || 
            t.transactionType === 'adjustment-negative' ||
            t.transactionType === 'loss'
        ).length;
        
        const totalDispenses = transactions.filter(t => 
            t.transactionType === 'dispense'
        ).length;
        
        const totalReceives = transactions.filter(t => 
            t.transactionType === 'receive'
        ).length;
        
        // Get recent activity
        const recentActivity = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
            .map(t => ({
                action: `${t.transactionType} - ${t.productName}`,
                date: t.date
            }));
        
        res.json({
            success: true,
            data: {
                userId: user._id,
                name: user.firstName + ' ' + user.lastName,
                role: user.role,
                totalTransactions,
                totalAdjustments,
                totalDispenses,
                totalReceives,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Get staff performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching staff performance'
        });
    }
};
