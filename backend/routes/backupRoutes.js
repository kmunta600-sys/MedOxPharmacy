const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Settings = require('../models/Settings');
const { createBackup, listBackups } = require('../services/backupService');
const fs = require('fs');
const path = require('path');

// Create backup
router.post('/create', auth, async (req, res) => {
    try {
        // Get backup location from settings
        const settings = await Settings.findOne();
        const backupPath = settings?.backupLocation || 'C:\\MedOxPharmacy\\backups';
        
        // Create backup directory if it doesn't exist
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        
        const backupFile = await createBackup(backupPath);
        
        res.json({
            success: true,
            message: 'Backup created successfully',
            data: {
                file: backupFile,
                location: backupPath
            }
        });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating backup: ' + error.message
        });
    }
});

// List backups
router.get('/list', auth, async (req, res) => {
    try {
        const settings = await Settings.findOne();
        const backupPath = settings?.backupLocation || 'C:\\MedOxPharmacy\\backups';
        
        const backups = listBackups(backupPath);
        
        res.json({
            success: true,
            data: backups,
            count: backups.length,
            location: backupPath
        });
    } catch (error) {
        console.error('List backups error:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing backups'
        });
    }
});

// Download backup
router.get('/download/:filename', auth, async (req, res) => {
    try {
        const settings = await Settings.findOne();
        const backupPath = settings?.backupLocation || 'C:\\MedOxPharmacy\\backups';
        const filename = req.params.filename;
        const filePath = path.join(backupPath, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }
        
        res.download(filePath, filename);
    } catch (error) {
        console.error('Download backup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading backup'
        });
    }
});

module.exports = router;
