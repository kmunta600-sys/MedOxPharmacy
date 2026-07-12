const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./backend/models/User');

const seedUsers = async () => {
    try {
        // Connect to MongoDB with options
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medox_pharmacy';
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️ Cleared existing users');

        // Create demo users
        const users = [
            {
                firstName: 'John',
                lastName: 'Banda',
                email: 'demo@medox.com',
                password: 'password123',
                role: 'admin',
                phone: '+265 999 123 456',
                isActive: true
            },
            {
                firstName: 'Mary',
                lastName: 'Kamanga',
                email: 'mary@medox.com',
                password: 'password123',
                role: 'pharmacist',
                phone: '+265 888 456 789',
                isActive: true
            },
            {
                firstName: 'Peter',
                lastName: 'Mwale',
                email: 'peter@medox.com',
                password: 'password123',
                role: 'technician',
                phone: '+265 777 789 123',
                isActive: true
            }
        ];

        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created user: ${user.email} (${user.role})`);
        }

        console.log('\n✅ Seed completed!');
        console.log('\n🔑 Demo Credentials:');
        console.log('   Email: demo@medox.com');
        console.log('   Password: password123');
        console.log('   Role: admin');

        process.exit(0);

    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedUsers();
