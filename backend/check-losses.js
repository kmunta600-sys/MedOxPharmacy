const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Check the specific product
            const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
            const product = await Product.findById('6a46867e4433f55d8892a585');
            
            if (product) {
                console.log('📦 Product:', product.name);
                console.log('   Quantity:', product.quantityOnHand);
                console.log('   ID:', product._id);
            }
            
            // Check all transactions for this product
            const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
            const transactions = await Transaction.find({ productId: '6a46867e4433f55d8892a585' });
            
            console.log(`\n📊 Transactions found: ${transactions.length}`);
            transactions.forEach((t, i) => {
                console.log(`   ${i+1}. Type: ${t.type}`);
                console.log(`      Quantity: ${t.quantity}`);
                console.log(`      Previous: ${t.previousQuantity}`);
                console.log(`      New: ${t.newQuantity}`);
                console.log(`      Remarks: ${t.remarks}`);
                console.log(`      ---`);
            });
            
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            await mongoose.disconnect();
            console.log('\n🔌 Disconnected');
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
