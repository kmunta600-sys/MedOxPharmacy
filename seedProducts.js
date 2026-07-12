const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./backend/models/Product');
const User = require('./backend/models/User');

const seedProducts = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medox_pharmacy';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');

        // Find admin user
        const admin = await User.findOne({ email: 'demo@medox.com' });
        if (!admin) {
            console.log('⚠️ Admin user not found! Please run: node seed.js first');
            process.exit(1);
        }
        console.log(`✅ Found admin user: ${admin.email}`);

        // Calculate expiry dates
        const today = new Date();
        const futureDate = (months) => {
            const d = new Date(today);
            d.setMonth(d.getMonth() + months);
            return d;
        };

        const products = [
            {
                name: 'Paracetamol',
                strength: '500mg',
                category: 'Analgesic',
                dosageForm: 'Tablet',
                unitOfIssue: 'Strip',
                quantityOnHand: 117,
                batchNumber: 'B-2026-001',
                expiryDate: futureDate(24),
                minStock: 50,
                maxStock: 500,
                unitCost: 300,
                sellingPrice: 500,
                createdBy: admin._id,
                code: 'PCM-500-001'
            },
            {
                name: 'Amoxicillin',
                strength: '250mg',
                category: 'Antibiotic',
                dosageForm: 'Capsule',
                unitOfIssue: 'Strip',
                quantityOnHand: 50,
                batchNumber: 'B-2026-002',
                expiryDate: futureDate(18),
                minStock: 30,
                maxStock: 300,
                unitCost: 400,
                sellingPrice: 650,
                createdBy: admin._id,
                code: 'AMX-250-001'
            },
            {
                name: 'Ibuprofen',
                strength: '400mg',
                category: 'Analgesic',
                dosageForm: 'Tablet',
                unitOfIssue: 'Strip',
                quantityOnHand: 5,
                batchNumber: 'B-2026-003',
                expiryDate: futureDate(12),
                minStock: 20,
                maxStock: 200,
                unitCost: 250,
                sellingPrice: 400,
                createdBy: admin._id,
                code: 'IBU-400-001'
            },
            {
                name: 'Vitamin C',
                strength: '100mg',
                category: 'Vitamin',
                dosageForm: 'Tablet',
                unitOfIssue: 'Bottle',
                quantityOnHand: 20,
                batchNumber: 'B-2026-004',
                expiryDate: futureDate(8),
                minStock: 30,
                maxStock: 150,
                unitCost: 200,
                sellingPrice: 350,
                createdBy: admin._id,
                code: 'VTC-100-001'
            },
            {
                name: 'Metformin',
                strength: '500mg',
                category: 'Antidiabetic',
                dosageForm: 'Tablet',
                unitOfIssue: 'Strip',
                quantityOnHand: 45,
                batchNumber: 'B-2026-005',
                expiryDate: futureDate(20),
                minStock: 50,
                maxStock: 400,
                unitCost: 350,
                sellingPrice: 550,
                createdBy: admin._id,
                code: 'MET-500-001'
            },
            {
                name: 'Artemether',
                strength: '20mg',
                category: 'Antimalarial',
                dosageForm: 'Tablet',
                unitOfIssue: 'Strip',
                quantityOnHand: 80,
                batchNumber: 'B-2026-006',
                expiryDate: futureDate(15),
                minStock: 40,
                maxStock: 250,
                unitCost: 500,
                sellingPrice: 750,
                createdBy: admin._id,
                code: 'ART-020-001'
            }
        ];

        for (const productData of products) {
            const product = new Product(productData);
            await product.save();
            console.log(`✅ Created: ${product.name} ${product.strength} | Batch: ${product.batchNumber} | Stock: ${product.quantityOnHand} | Expiry: ${product.expiryDate.toISOString().split('T')[0]}`);
        }

        console.log('\n✅ Seed completed!');
        console.log(`📊 Products created: ${products.length}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedProducts();
