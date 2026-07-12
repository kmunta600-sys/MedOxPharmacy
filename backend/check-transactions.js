const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Check if Transaction model exists
            let Transaction;
            try {
                Transaction = mongoose.model('Transaction');
            } catch (e) {
                Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
            }
            
            const transactions = await Transaction.find();
            console.log(`📊 Total transactions in database: ${transactions.length}`);
            
            if (transactions.length > 0) {
                console.log('📋 Recent transactions:');
                transactions.slice(0, 5).forEach(t => {
                    console.log(`   - ${t.productName}: ${t.type} ${t.quantity} units (${t.date})`);
                });
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            await mongoose.disconnect();
            console.log('🔌 Disconnected');
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
