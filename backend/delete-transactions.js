const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medoxpharmacy')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        try {
            const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
            const result = await Transaction.deleteMany({});
            console.log(`✅ Deleted ${result.deletedCount} transactions`);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            await mongoose.disconnect();
        }
    })
    .catch(err => console.error('Error:', err));
