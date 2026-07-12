const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const fixUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the demo user
        const user = await User.findOne({ email: 'demo@medox.com' });
        
        if (user) {
            console.log('📤 Found demo user, resetting password...');
            
            // Set password directly (will be hashed by pre-save hook)
            user.password = 'kondwani';
            await user.save();
            
            console.log('✅ Password reset for demo@medox.com');
            console.log('   Password: kondwani');
            console.log('   Role: admin');
        } else {
            console.log('📤 Creating new demo user...');
            
            const newUser = new User({
                firstName: 'Dr. Demo',
                lastName: 'User',
                email: 'demo@medox.com',
                password: 'kondwani',
                role: 'admin',
                phone: '+265 888 888 888',
                notificationEmail: 'kmunta600@gmail.com',
                isActive: true
            });
            
            await newUser.save();
            console.log('✅ Demo user created!');
            console.log('   Email: demo@medox.com');
            console.log('   Password: kondwani');
            console.log('   Role: admin');
        }

        // Verify the user can login
        const verifiedUser = await User.findOne({ email: 'demo@medox.com' });
        console.log('');
        console.log('📋 User details:');
        console.log(`   ID: ${verifiedUser._id}`);
        console.log(`   Name: ${verifiedUser.firstName} ${verifiedUser.lastName}`);
        console.log(`   Email: ${verifiedUser.email}`);
        console.log(`   Role: ${verifiedUser.role}`);
        console.log(`   Active: ${verifiedUser.isActive}`);

        // Test password match
        const isMatch = await verifiedUser.comparePassword('kondwani');
        console.log(`   Password test: ${isMatch ? '✅ MATCH' : '❌ FAIL'}`);

        console.log('');
        console.log('✅ Fix complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixUser();
