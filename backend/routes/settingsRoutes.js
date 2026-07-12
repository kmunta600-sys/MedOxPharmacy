const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Settings = require('../models/Settings');

// GET settings
router.get('/', auth, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Error fetching settings' });
    }
});

// UPDATE settings
router.put('/', auth, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }
        const updateFields = ['pharmacyName', 'pharmacyAddress', 'pharmacyPhone', 'pharmacyEmail',
            'facilityLicense', 'currency', 'taxRate', 'lowStockThreshold', 'criticalStockThreshold',
            'expiryWarningDays', 'autoBackup', 'enableFEFO', 'requireApproval', 'enableNotifications',
            'backupFrequency', 'backupTime', 'backupLocation'];
        for (const field of updateFields) {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        }
        await settings.save();
        res.json({ success: true, message: 'Settings updated', data: settings });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Error updating settings' });
    }
});

// GET roles
router.get('/roles', auth, async (req, res) => {
    try {
        const roles = [
            { value: 'admin', label: 'Admin', description: 'Full system access' },
            { value: 'pharmacist', label: 'Pharmacist', description: 'Manage prescriptions and stock' },
            { value: 'technician', label: 'Technician', description: 'Assist with dispensing' }
        ];
        res.json({ success: true, data: roles });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ success: false, message: 'Error fetching roles' });
    }
});

module.exports = router;
