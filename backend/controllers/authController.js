const User = require('../models/User');

// ============================================================
// REGISTER
// ============================================================
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone, notificationEmail, address } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role: role || 'viewer',
            phone: phone || '',
            notificationEmail: notificationEmail || '',
            address: address || ''
        });;

        await user.save();

        const token = user.generateAuthToken();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    phone: user.phone || '',
                    notificationEmail: user.notificationEmail || '',
                    address: user.address || ''
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// ============================================================
// LOGIN
// ============================================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔑 Login attempt for:', email);

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('   ❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('   ❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('   ✅ Password matched for:', email);

        const token = user.generateAuthToken();
        console.log('   ✅ Token generated');

        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    phone: user.phone || '',
                    notificationEmail: user.notificationEmail || '',
                    address: user.address || ''
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// ============================================================
// GET CURRENT USER
// ============================================================
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
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
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================================
// LOGOUT
// ============================================================
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};


