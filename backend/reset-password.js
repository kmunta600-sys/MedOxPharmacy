const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Get User model
            let User;
            try {
                User = mongoose.model('User');
            } catch (e) {
                const userSchema = new mongoose.Schema({
                    firstName: String,
                    lastName: String,
                    email: { type: String, unique: true },
                    password: String,
                    role: String
                });
                User = mongoose.model('User', userSchema);
            }
            
            // Reset password for demo user
            const newPassword = 'password123';
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            const result = await User.findOneAndUpdate(
                { email: 'demo@medox.com' },
                { $set: { password: hashedPassword } },
                { new: true, upsert: true }
            );
            
            console.log('✅ Password reset successful!');
            console.log('   Email: demo@medox.com');
            console.log('   New Password: password123');
            console.log('   User:', result.firstName, result.lastName);
            
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            await mongoose.disconnect();
            console.log('\n🔌 Disconnected');
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
