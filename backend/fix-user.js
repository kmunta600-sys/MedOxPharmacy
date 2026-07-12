const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fixUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        console.log('✅ Connected to MongoDB');
        
        // Find the user
        const user = await User.findOne({ email: 'demo@medox.com' });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('📦 Found user:', user.email);
        console.log('   Current password hash:', user.password ? user.password.substring(0, 20) + '...' : 'Missing');
        
        // Generate a new password hash for 'password123'
        const newPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update the user
        user.password = hashedPassword;
        user.isActive = true;
        await user.save();
        
        console.log('✅ Password updated successfully!');
        console.log('   Email: demo@medox.com');
        console.log('   Password: password123');
        console.log('   New hash:', hashedPassword.substring(0, 20) + '...');
        
        // Verify the password works
        const isMatch = await bcrypt.compare(newPassword, user.password);
        console.log('   Verification - Password matches:', isMatch);
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        console.log('');
        console.log('🎉 Login with:');
        console.log('   Email: demo@medox.com');
        console.log('   Password: password123');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixUser();
