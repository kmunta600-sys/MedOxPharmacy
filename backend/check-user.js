const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Check if User model exists
            let User;
            try {
                User = mongoose.model('User');
            } catch (e) {
                // Create User schema if it doesn't exist
                const userSchema = new mongoose.Schema({
                    firstName: String,
                    lastName: String,
                    email: { type: String, unique: true },
                    password: String,
                    role: String
                });
                User = mongoose.model('User', userSchema);
            }
            
            // Check for demo user
            const demoUser = await User.findOne({ email: 'demo@medox.com' });
            
            if (demoUser) {
                console.log('✅ Demo user found:', demoUser.email);
                console.log('   First Name:', demoUser.firstName);
                console.log('   Role:', demoUser.role);
                console.log('   Password hash:', demoUser.password.substring(0, 20) + '...');
            } else {
                console.log('❌ Demo user NOT found - creating one...');
                
                // Create demo user
                const hashedPassword = await bcrypt.hash('password123', 10);
                const newUser = new User({
                    firstName: 'Demo',
                    lastName: 'User',
                    email: 'demo@medox.com',
                    password: hashedPassword,
                    role: 'admin'
                });
                await newUser.save();
                console.log('✅ Demo user created!');
                console.log('   Email: demo@medox.com');
                console.log('   Password: password123');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            await mongoose.disconnect();
            console.log('\n🔌 Disconnected');
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
