const mongoose = require('mongoose');

const stockCardSchema = new mongoose.Schema({
    // Product Information
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: { type: String, required: true },
    strength: { type: String },
    dosageForm: { type: String },
    productCode: { type: String },
    unitOfIssue: { type: String, default: 'Each' },
    
    // Transaction Details
    date: { type: Date, required: true },
    dnoteNumber: { type: String },
    referenceNumber: { type: String },
    issuedTo: { type: String },
    receivedFrom: { type: String },
    
    // Movement Details
    quantityReceived: { type: Number, default: 0 },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    quantityIssued: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    positiveAdjustment: { type: Number, default: 0 },
    negativeAdjustment: { type: Number, default: 0 },
    
    // Stock Balance
    quantityOnHand: { type: Number, required: true },
    
    // Transaction Type
    transactionType: {
        type: String,
        enum: ['receive', 'dispense', 'adjustment-positive', 'adjustment-negative', 'loss', 'spot-check', 'physical-inventory'],
        required: true
    },
    
    // Officer Information
    transactingOfficer: { type: String, required: true },
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    signature: { type: String },
    
    // Remarks
    remarks: { type: String },
    
    // Spot Check / Physical Inventory
    isSpotCheck: { type: Boolean, default: false },
    isPhysicalInventory: { type: Boolean, default: false },
    physicalCount: { type: Number },
    variance: { type: Number },
    isVerified: { type: Boolean, default: false },
    spotCheckDate: { type: Date },
    
    // Month End Physical Inventory
    isMonthEnd: { type: Boolean, default: false },
    monthEndDate: { type: Date },
    
    createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
stockCardSchema.index({ productId: 1, date: -1 });
stockCardSchema.index({ productId: 1, batchNumber: 1 });
stockCardSchema.index({ date: 1 });
stockCardSchema.index({ isSpotCheck: 1 });
stockCardSchema.index({ isPhysicalInventory: 1 });

module.exports = mongoose.model('StockCard', stockCardSchema);
