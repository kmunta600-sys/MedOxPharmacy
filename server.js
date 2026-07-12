require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medox_pharmacy';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

// Auth Routes
const authRoutes = require('./backend/routes/auth');
app.use('/api/auth', authRoutes);

// Product Routes
const productRoutes = require('./backend/routes/products');
app.use('/api/products', productRoutes);

// Transaction Routes
const transactionRoutes = require('./backend/routes/transactions');
app.use('/api/transactions', transactionRoutes);

// Test Route
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`💊 Medox Pharmacy Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
});

