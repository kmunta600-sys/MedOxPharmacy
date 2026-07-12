const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function resetAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/medox');
        const adminEmail = 'admin@medox.mw';

        // Delete existing admin if any
        const deleted = await User.deleteOne({ email: adminEmail });
        if (deleted.deletedCount > 0) {
            console.log('🗑️ Removed old admin user');
        }

        // Create new admin with correct hash
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
        console.log('✅ Admin user re-created:', user.email);
        console.log('✅ Password: Admin@2026');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
resetAdmin();
