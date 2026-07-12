const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    facilityCode: { type: String, required: true, unique: true, uppercase: true },
    facilityName: { type: String, required: true },
    facilityType: {
        type: String,
        enum: ['hospital', 'health_center', 'clinic', 'pharmacy', 'district_office'],
        required: true
    },
    district: { type: String, required: true },
    region: { type: String, enum: ['Northern', 'Central', 'Southern'], required: true },
    address: String,
    phone: String,
    email: String,
    latitude: Number,
    longitude: Number,
    active: { type: Boolean, default: true },
    parentFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Facility', facilitySchema);
