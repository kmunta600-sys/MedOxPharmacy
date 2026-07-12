const mongoose = require('mongoose');

const StockTransactionSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['receive', 'dispense', 'adjustment', 'return'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    batchNumber: {
        type: String
    },
    dnoteNumber: {
        type: String
    },
    supplier: {
        type: String
    },
    expiryDate: {
        type: Date
    },
    costPrice: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String
    },
    receivedBy: {
        type: String,
        default: 'system'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StockTransaction', StockTransactionSchema);
