const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    transactionType: {
        type: String,
        enum: ['receipt', 'issue', 'loss', 'adjustment', 'return'],
        required: true
    },
    transactionDate: { type: Date, default: Date.now },
    quantityReceived: { type: Number, default: 0, min: 0 },
    quantityIssued: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    documentNumber: String,
    sourceOrDestination: {
        type: String,
        enum: ['central_store', 'district_store', 'supplier', 'facility', 'patient', 'ward', 'other']
    },
    sourceOrDestinationName: String,
    remarks: String,
    balanceAfter: { type: Number, required: true, min: 0 },
    unitCost: Number,
    totalCost: Number,
    transactingOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

stockTransactionSchema.index({ batchNumber: 1, expiryDate: 1 });
stockTransactionSchema.index({ product: 1, facility: 1, transactionDate: -1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
