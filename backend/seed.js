const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        
        // Check if demo user exists
        const existingUser = await User.findOne({ email: 'demo@medox.com' });
        if (existingUser) {
            console.log('✅ Demo user already exists');
            process.exit(0);
        }
        
        // Create demo user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const user = new User({
            email: 'demo@medox.com',
            password: hashedPassword,
            firstName: 'Demo',
            lastName: 'User',
            role: 'admin'
        });
        
        await user.save();
        console.log('✅ Demo user created successfully!');
        console.log('   Email: demo@medox.com');
        console.log('   Password: password123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
