const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Get User model
            const userSchema = new mongoose.Schema({}, { strict: false });
            const User = mongoose.model('User', userSchema, 'users');
            
            const user = await User.findOne({ email: 'demo@medox.com' });
            if (user) {
                console.log('📋 User found:');
                console.log('   Email:', user.email);
                console.log('   First Name:', user.firstName);
                console.log('   Role:', user.role);
                console.log('   Password hash:', user.password);
                
                // Test password verification
                const testPassword = 'password123';
                const isMatch = await bcrypt.compare(testPassword, user.password);
                console.log('\n🔑 Password test:');
                console.log(`   Password "${testPassword}" matches: ${isMatch}`);
                
                if (!isMatch) {
                    console.log('\n⚠️ Password mismatch! Resetting password...');
                    
                    // Reset password
                    const newHash = await bcrypt.hash('password123', 10);
                    await User.updateOne(
                        { email: 'demo@medox.com' },
                        { $set: { password: newHash } }
                    );
                    console.log('✅ Password reset to: password123');
                }
            } else {
                console.log('❌ User NOT found - creating one...');
                const newUser = new User({
                    email: 'demo@medox.com',
                    password: await bcrypt.hash('password123', 10),
                    firstName: 'Demo',
                    lastName: 'User',
                    role: 'admin'
                });
                await newUser.save();
                console.log('✅ Demo user created with password: password123');
            }
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            await mongoose.disconnect();
            console.log('\n🔌 Disconnected');
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
