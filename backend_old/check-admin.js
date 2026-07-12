const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkAndFixAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/medox');
        const admin = await User.findOne({ email: 'admin@medox.mw' }).select('+password');
        if (!admin) {
            console.log('❌ Admin not found – creating...');
            const hashed = await bcrypt.hash('Admin@2026', 12);
            await User.create({
                fullName: 'System Administrator',
                email: 'admin@medox.mw',
                phone: '+265999999999',
                password: hashed,
                role: 'admin',
                isActive: true,
                isApproved: true
            });
            console.log('✅ Admin created with fresh hash');
            process.exit(0);
        }

        console.log('✅ Admin found:', admin.email);
        console.log('Hash stored:', admin.password);

        const isMatch = await bcrypt.compare('Admin@2026', admin.password);
        console.log('Password match?', isMatch);

        if (!isMatch) {
            console.log('⚠️ Password mismatch – updating hash...');
            const newHash = await bcrypt.hash('Admin@2026', 12);
            await User.updateOne({ email: 'admin@medox.mw' }, { password: newHash });
            console.log('✅ Password hash updated');
            // Verify again
            const updated = await User.findOne({ email: 'admin@medox.mw' }).select('+password');
            const newMatch = await bcrypt.compare('Admin@2026', updated.password);
            console.log('New password match?', newMatch);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
checkAndFixAdmin();
