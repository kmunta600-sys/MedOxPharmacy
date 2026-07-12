const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    pharmacyName: { type: String, default: 'MedOx Pharmacy' },
    pharmacyAddress: { type: String, default: '123 Pharmacy Street, City' },
    pharmacyPhone: { type: String, default: '+265 888 888 888' },
    pharmacyEmail: { type: String, default: 'info@medoxpharmacy.com' },
    facilityLicense: { type: String, default: '' },
    currency: { type: String, default: 'MWK' },
    taxRate: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    criticalStockThreshold: { type: Number, default: 5 },
    expiryWarningDays: { type: Number, default: 30 },
    autoBackup: { type: Boolean, default: true },
    enableFEFO: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: true },
    enableNotifications: { type: Boolean, default: true },
    backupFrequency: { type: String, default: 'daily' },
    backupTime: { type: String, default: '23:00' },
    backupLocation: { type: String, default: 'C:\\MedOxPharmacy\\backups' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Settings', settingsSchema);
