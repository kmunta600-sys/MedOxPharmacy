const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function deleteAndRecreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        console.log('✅ Connected to MongoDB');
        
        // Delete the user
        const result = await User.deleteOne({ email: 'demo@medox.com' });
        console.log(`✅ Deleted user: ${result.deletedCount > 0 ? 'Found and deleted' : 'User not found'}`);
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        console.log('');
        console.log('Now run the registration again!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

deleteAndRecreate();
