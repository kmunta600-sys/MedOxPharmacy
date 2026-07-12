const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Check products
            const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
            const products = await Product.find();
            console.log(`📊 Products in database: ${products.length}`);
            
            if (products.length > 0) {
                console.log('📋 Sample product:');
                const p = products[0];
                console.log(`   Name: ${p.name}`);
                console.log(`   ID: ${p._id}`);
                console.log(`   Quantity: ${p.quantityOnHand}`);
            }
            
            // Check transactions
            const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
            const transactions = await Transaction.find();
            console.log(`📊 Transactions in database: ${transactions.length}`);
            
            if (transactions.length > 0) {
                console.log('📋 Sample transaction:');
                const t = transactions[0];
                console.log(`   Type: ${t.type}`);
                console.log(`   Quantity: ${t.quantity}`);
                console.log(`   New Quantity: ${t.newQuantity}`);
            }
            
        } catch (error) {
            console.error('❌ Error checking database:', error);
        } finally {
            await mongoose.disconnect();
            console.log('🔌 Disconnected');
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        console.log('📌 Make sure MongoDB is running!');
    });
