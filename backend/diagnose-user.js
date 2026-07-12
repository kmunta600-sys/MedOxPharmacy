const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        console.log('✅ Connected to MongoDB');
        
        // Find all users
        const users = await User.find({});
        console.log(`\n📋 Found ${users.length} user(s):`);
        
        for (const user of users) {
            console.log(`\n📦 User: ${user.email}`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   Password hash: ${user.password ? 'Present (' + user.password.substring(0, 20) + '...)' : 'Missing'}`);
            
            // Test password 'password123'
            const testPassword = 'password123';
            const isMatch = await bcrypt.compare(testPassword, user.password);
            console.log(`   Password 'password123' matches: ${isMatch}`);
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

diagnose();
