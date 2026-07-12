const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function cleanUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        console.log('✅ Connected to MongoDB');
        
        // Show existing users
        const users = await User.find({});
        console.log(`\n📋 Found ${users.length} user(s):`);
        for (const user of users) {
            console.log(`   - ${user.email} (${user.role})`);
        }
        
        // Delete all users
        if (users.length > 0) {
            await User.deleteMany({});
            console.log('\n✅ All users deleted');
        }
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

cleanUsers();
