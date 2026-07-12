const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fixUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        console.log('✅ Connected to MongoDB');
        
        // Delete all existing users
        await User.deleteMany({});
        console.log('✅ Removed all existing users');
        
        // Create a new user with the correct password
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Created hash for password:', password);
        console.log('   Hash:', hashedPassword);
        
        // Verify the hash works
        const testMatch = await bcrypt.compare(password, hashedPassword);
        console.log('   Hash verification:', testMatch);
        
        const user = new User({
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@medox.com',
            password: hashedPassword,
            role: 'admin',
            phone: '+265888888888',
            address: '123 Pharmacy Street',
            isActive: true
        });
        
        await user.save();
        console.log('✅ User created successfully!');
        console.log('   Email: demo@medox.com');
        console.log('   Password: password123');
        
        // Verify the saved user
        const savedUser = await User.findOne({ email: 'demo@medox.com' });
        if (savedUser) {
            const verifyMatch = await bcrypt.compare(password, savedUser.password);
            console.log('   Saved user password verification:', verifyMatch);
        }
        
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
