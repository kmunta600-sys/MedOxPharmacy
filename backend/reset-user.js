const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        console.log('✅ Connected to MongoDB');
        
        // Delete existing user if exists
        await User.deleteOne({ email: 'demo@medox.com' });
        console.log('✅ Removed existing user');
        
        // Create new user
        const hashedPassword = await bcrypt.hash('password123', 10);
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
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

resetUser();
