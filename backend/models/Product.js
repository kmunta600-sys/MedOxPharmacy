const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    strength: {
        type: String,
        default: ''
    },
    code: {
        type: String,
        default: function() {
            return 'MED' + Math.floor(1000 + Math.random() * 9000);
        },
        sparse: true
    },
    category: {
        type: String,
        default: 'Other'
    },
    dosageForm: {
        type: String,
        default: ''
    },
    quantityOnHand: {
        type: Number,
        default: 0
    },
    isQuarantined: {
        type: Boolean,
        default: false
    },
    batchNumber: {
        type: String,
        default: ''
    },
    expiryDate: {
        type: Date
    },
    dnoteNumber: {
        type: String,
        default: ''
    },
    supplier: {
        type: String,
        default: ''
    },
    remarks: {
        type: String,
        default: ''
    },
    minStock: {
        type: Number,
        default: 50
    },
    maxStock: {
        type: Number,
        default: 500
    },
    unitCost: {
        type: Number,
        default: 0
    },
    sellingPrice: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Block expired products from being added
ProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Check if this is a new product
    if (this.isNew && this.expiryDate) {
        const expiry = new Date(this.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // BLOCK EXPIRED PRODUCTS
        if (expiry < today) {
            const error = new Error('❌ Cannot add expired medicine. Please select a valid future date.');
            error.status = 400;
            return next(error);
        }
    }
    
    next();
});

module.exports = mongoose.model('Product', ProductSchema);