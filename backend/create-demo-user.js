const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    phone: String,
    notificationEmail: String,
    address: String,
    isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Check if user exists
        let user = await User.findOne({ email: 'demo@medox.com' });
        if (user) {
            console.log('✅ Demo user already exists');
            console.log('   Email: demo@medox.com');
            console.log('   Password: kondwani');
            process.exit(0);
        }

        // Create user
        const hashedPassword = await bcrypt.hash('kondwani', 10);
        user = new User({
            firstName: 'Dr. Demo',
            lastName: 'User',
            email: 'demo@medox.com',
            password: hashedPassword,
            role: 'admin',
            phone: '+265 888 888 888',
            notificationEmail: 'demo@medox.com',
            isActive: true
        });

        await user.save();
        console.log('✅ Demo user created!');
        console.log('   Email: demo@medox.com');
        console.log('   Password: kondwani');
        console.log('   Role: admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createUser();
