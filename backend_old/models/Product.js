const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productCode: { type: String, required: true, unique: true, uppercase: true },
    productName: { type: String, required: true, index: true },
    strength: { type: String, required: true },
    dosageForm: {
        type: String,
        enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'powder', 'inhaler'],
        required: true
    },
    unitOfIssue: {
        type: String,
        enum: ['each', 'strip', 'bottle', 'vial', 'ampoule', 'tube', 'pack', 'box'],
        required: true
    },
    category: {
        type: String,
        enum: ['antibiotic', 'antimalarial', 'antiretroviral', 'vaccine', 'painkiller', 'antihypertensive', 'antidiabetic', 'other'],
        default: 'other'
    },
    description: String,
    minStockLevel: { type: Number, default: 10 },
    maxStockLevel: Number,
    reorderPoint: { type: Number, default: 20 },
    storageConditions: String,
    isControlled: { type: Boolean, default: false },
    requiresPrescription: { type: Boolean, default: true },
    activeIngredients: [String],
    manufacturer: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

productSchema.index({ productName: 'text', productCode: 'text' });

module.exports = mongoose.model('Product', productSchema);
