const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/medox');
        const adminEmail = 'admin@medox.mw';
        const exists = await User.findOne({ email: adminEmail });
        if (exists) {
            console.log('✅ Admin already exists:', exists.email);
            process.exit(0);
        }
        const hashedPassword = await bcrypt.hash('Admin@2026', 12);
        const user = await User.create({
            fullName: 'System Administrator',
            email: adminEmail,
            phone: '+265999999999',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            isApproved: true
        });
        console.log('✅ Admin user created:', user.email);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
createAdmin();
