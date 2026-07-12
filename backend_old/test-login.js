const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
    await mongoose.connect('mongodb://localhost:27017/medox');
    const user = await User.findOne({ email: 'admin@medox.mw' }).select('+password');
    if (!user) return console.log('User not found');
    const isMatch = await user.comparePassword('Admin@2026');
    console.log('comparePassword result:', isMatch);
    console.log('user.isActive:', user.isActive);
    console.log('user.isApproved:', user.isApproved);
    process.exit(0);
}
testLogin();
