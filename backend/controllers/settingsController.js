const Settings = require('../models/Settings');

// ============================================================
// GET SETTINGS
// ============================================================
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
};

// ============================================================
// UPDATE SETTINGS
// ============================================================
exports.updateSettings = async (req, res) => {
    try {
        const { general, system, backup, roles } = req.body;
        
        const settings = await Settings.getSettings();
        
        if (general) settings.general = { ...settings.general, ...general };
        if (system) settings.system = { ...settings.system, ...system };
        if (backup) settings.backup = { ...settings.backup, ...backup };
        if (roles) settings.roles = roles;
        
        settings.updatedBy = req.user?.id;
        settings.updatedAt = new Date();
        
        await settings.save();
        
        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings'
        });
    }
};

// ============================================================
// GET ROLES
// ============================================================
exports.getRoles = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({
            success: true,
            data: settings.roles || ['Pharmacist', 'Admin', 'Assistant', 'Manager']
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roles'
        });
    }
};

// ============================================================
// UPDATE ROLES
// ============================================================
exports.updateRoles = async (req, res) => {
    try {
        const { roles } = req.body;
        
        if (!roles || !Array.isArray(roles)) {
            return res.status(400).json({
                success: false,
                message: 'Roles must be an array'
            });
        }
        
        const settings = await Settings.getSettings();
        settings.roles = roles;
        settings.updatedBy = req.user?.id;
        settings.updatedAt = new Date();
        
        await settings.save();
        
        res.json({
            success: true,
            message: 'Roles updated successfully',
            data: settings.roles
        });
    } catch (error) {
        console.error('Update roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating roles'
        });
    }
};

// ============================================================
// RESET SETTINGS TO DEFAULT
// ============================================================
exports.resetSettings = async (req, res) => {
    try {
        await Settings.deleteMany({});
        const settings = await Settings.getSettings();
        
        res.json({
            success: true,
            message: 'Settings reset to default',
            data: settings
        });
    } catch (error) {
        console.error('Reset settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting settings'
        });
    }
};
