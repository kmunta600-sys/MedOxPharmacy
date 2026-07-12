const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const quarantineRoutes = require('./routes/quarantineRoutes');
const stockCardRoutes = require('./routes/stockCardRoutes');
const staffRoutes = require('./routes/staffRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const backupRoutes = require('./routes/backupRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

const uploadsDir = path.join(__dirname, 'uploads/picking-lists');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/quarantine', quarantineRoutes);
app.use('/api/stockcard', stockCardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

const mongoURI = process.env.MONGODB_URI || 'mongodb://kmunta600_db_user:j3L6BhZ323b3mIK0@ac-vn1mapw-shard-00-00.m75px6q.mongodb.net:27017,ac-vn1mapw-shard-00-01.m75px6q.mongodb.net:27017,ac-vn1mapw-shard-00-02.m75px6q.mongodb.net:27017/medox_pharmacy?ssl=true&replicaSet=atlas-tpe2bp-shard-0&authSource=admin&appName=Cluster0';
console.log('🔍 Connecting to MongoDB...');
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

module.exports = app;
