const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Check current products
            const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
            const products = await Product.find();
            console.log(`📊 Current products: ${products.length}`);
            
            if (products.length > 0) {
                console.log('📋 Products found:');
                products.forEach(p => {
                    console.log(`   - ${p.name}: ${p.quantityOnHand} units`);
                });
                
                // Delete all products
                console.log('\n🗑️ Deleting all products...');
                const result = await Product.deleteMany({});
                console.log(`✅ Deleted ${result.deletedCount} products`);
            } else {
                console.log('✅ No products found');
            }
            
            // Also delete all transactions
            try {
                const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
                const transResult = await Transaction.deleteMany({});
                console.log(`✅ Deleted ${transResult.deletedCount} transactions`);
            } catch (e) {
                console.log('⚠️ No transactions collection found');
            }
            
            console.log('\n✅ All products and transactions deleted!');
            
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            await mongoose.disconnect();
            console.log('🔌 Disconnected');
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        console.log('📌 Make sure MongoDB is running!');
        process.exit(1);
    });
