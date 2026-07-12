const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productCode: {
        type: String
    },
    type: {
        type: String,
        enum: ['receipt', 'dispense', 'adjustment', 'physical_inventory', 'loss', 'initial'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousQuantity: {
        type: Number,
        required: true
    },
    newQuantity: {
        type: Number,
        required: true
    },
    docNumber: {
        type: String
    },
    issuedTo: {
        type: String
    },
    officer: {
        type: String
    },
    remarks: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    month: {
        type: String
    }
}, {
    timestamps: true
});

transactionSchema.index({ productId: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
