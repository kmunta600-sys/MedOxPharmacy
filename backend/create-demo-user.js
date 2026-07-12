const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the backend .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Define User schema directly (to avoid model issues)
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'viewer' },
    phone: { type: String, default: '' },
    notificationEmail: { type: String, default: '' },
    address: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createUser() {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('📤 Connecting to:', uri ? 'MongoDB Atlas' : 'No URI found');
        
        if (!uri) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // Delete existing demo user if exists
        await User.deleteOne({ email: 'demo@medox.com' });
        console.log('🗑️ Removed existing demo user');

        // Create new demo user
        const user = new User({
            firstName: 'Dr. Demo',
            lastName: 'User',
            email: 'demo@medox.com',
            password: 'kondwani',
            role: 'admin',
            phone: '+265 888 888 888',
            notificationEmail: 'kmunta600@gmail.com',
            isActive: true
        });

        await user.save();
        console.log('✅ Demo user created!');
        console.log('   Email: demo@medox.com');
        console.log('   Password: kondwani');
        console.log('   Role: admin');

        // Verify
        const verified = await User.findOne({ email: 'demo@medox.com' });
        const isMatch = await verified.comparePassword('kondwani');
        console.log(`   Password test: ${isMatch ? '✅ MATCH' : '❌ FAIL'}`);
        console.log('   User ID:', verified._id);

        console.log('');
        console.log('✅ Demo user ready!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createUser();
