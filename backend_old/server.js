require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const winston = require('winston');

const app = express();

// Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

// Security
app.use(helmet());
app.use(compression());
app.use(cors({ origin: '*', credentials: true }));

// Rate limiting
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----- Import routes -----
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');

// ----- Routes -----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);

// ----- MongoDB connection + auto‑seed admin -----
mongoose.connect('mongodb://localhost:27017/medox')
    .then(async () => {
        logger.info('✅ MongoDB connected');

        // Auto‑seed an admin user if none exists
        try {
            const User = require('./models/User');
            const adminEmail = 'admin@medox.mw';
            const adminExists = await User.findOne({ email: adminEmail });
            if (!adminExists) {
                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash('Admin@2026', 12);
                await User.create({
                    fullName: 'System Administrator',
                    email: adminEmail,
                    phone: '+265999999999',
                    password: hashedPassword,
                    role: 'admin',
                    isActive: true,
                    isApproved: true
                });
                logger.info('✅ Default admin user created: admin@medox.mw / Admin@2026');
            }
        } catch (seedError) {
            logger.error('❌ Auto‑seed failed:', seedError.message);
        }
    })
    .catch(err => logger.error('❌ MongoDB connection error:', err));

// ----- Health check -----
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// ----- Welcome -----
app.get('/', (req, res) => {
    res.json({
        name: 'MedOx Pharmacy System',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            stock: '/api/stock',
            health: '/health'
        }
    });
});

// ----- Error handler -----
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// ----- Start server -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`🚀 MedOx Pharmacy System running on port ${PORT}`);
});

module.exports = app;
