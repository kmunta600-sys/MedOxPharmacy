const mongoose = require('mongoose');

const quarantineSchema = new mongoose.Schema({
    // Product Information
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: { type: String, required: true },
    productCode: { type: String },
    batchNumber: { type: String, required: true },
    strength: { type: String },
    dosageForm: { type: String },
    supplier: { type: String },
    
    // Quarantine Details
    quarantineReference: {
        type: String,
        unique: true
    },
    quarantineDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    reason: {
        type: String,
        enum: [
            'expired',
            'recalled',
            'damaged',
            'temperature-excursion',
            'suspect-product',
            'returned-product',
            'quality-issue',
            'other'
        ],
        required: true
    },
    reasonDescription: { type: String },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: { type: String, default: 'unit' },
    expiryDate: { type: Date },
    location: { type: String, default: 'Quarantine Area' },
    
    // Responsible Personnel
    quarantinedBy: {
        type: String,
        required: true
    },
    quarantinedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: { type: String },
    
    // Status
    status: {
        type: String,
        enum: ['quarantined', 'pending-review', 'cleared', 'destroyed', 'returned'],
        default: 'quarantined'
    },
    
    // Disposition Details
    dispositionDate: { type: Date },
    dispositionAction: {
        type: String,
        enum: ['cleared', 'destroyed', 'returned', 'testing']
    },
    dispositionReason: { type: String },
    disposedBy: { type: String },
    
    // Additional Notes
    notes: { type: String },
    documents: [{
        name: String,
        url: String,
        uploadedBy: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    
    // Review/Inspection Details
    reviewedBy: { type: String },
    reviewDate: { type: Date },
    reviewNotes: { type: String },
    
    // Audit Trail
    history: [{
        action: { type: String },
        date: { type: Date, default: Date.now },
        performedBy: { type: String },
        details: { type: String }
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Generate Quarantine Reference Number - FIXED
quarantineSchema.pre('save', function(next) {
    if (this.isNew && !this.quarantineReference) {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.quarantineReference = `QR-${year}-${random}`;
    }
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Quarantine', quarantineSchema);
