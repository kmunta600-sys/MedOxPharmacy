const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./backend/models/User');

const fixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find demo user
        const user = await User.findOne({ email: 'demo@medox.com' });
        if (user) {
            console.log('✅ Found user:', user.email);
            
            // Re-save to trigger pre-save hook (re-hash password)
            // This ensures the password is hashed with the new salt
            user.password = 'password123'; // This will trigger the pre-save hook
            await user.save();
            console.log('✅ User password re-hashed');
            
            // Generate a new token to test
            const token = user.generateAuthToken();
            console.log('✅ New token generated:', token.substring(0, 50) + '...');
        } else {
            console.log('❌ User not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixUsers();
