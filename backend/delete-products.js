const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Get all collections
            const collections = mongoose.connection.collections;
            
            // Delete all products
            if (collections.products) {
                const result = await collections.products.deleteMany({});
                console.log(`✅ Deleted ${result.deletedCount} products`);
            } else {
                console.log('⚠️ Products collection not found');
            }
            
            // Delete all transactions
            if (collections.transactions) {
                const result = await collections.transactions.deleteMany({});
                console.log(`✅ Deleted ${result.deletedCount} transactions`);
            } else {
                console.log('⚠️ Transactions collection not found');
            }
            
            console.log('✅ All products and transactions deleted successfully!');
            
        } catch (error) {
            console.error('❌ Error deleting products:', error);
        } finally {
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB');
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
