const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function deleteAll() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy');
        await User.deleteMany({});
        console.log('✅ All users deleted');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}
deleteAll();
