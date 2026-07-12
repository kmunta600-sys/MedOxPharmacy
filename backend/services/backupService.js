const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Get all collections
const getCollections = async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    return collections.map(c => c.name);
};

// Export a collection to JSON
const exportCollection = async (collectionName) => {
    const collection = mongoose.connection.db.collection(collectionName);
    const data = await collection.find({}).toArray();
    return data;
};

// Create backup
const createBackup = async (backupPath) => {
    try {
        // Get all collections
        const collections = await getCollections();
        const backupData = {};
        
        // Export each collection
        for (const name of collections) {
            console.log(`📦 Exporting collection: ${name}`);
            backupData[name] = await exportCollection(name);
        }
        
        // Add metadata
        backupData._metadata = {
            createdAt: new Date().toISOString(),
            database: mongoose.connection.name,
            collections: collections.length,
            totalRecords: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0)
        };
        
        // Write to file
        const backupFile = path.join(backupPath, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        
        console.log(`✅ Backup created: ${backupFile}`);
        return backupFile;
    } catch (error) {
        console.error('❌ Backup error:', error);
        throw error;
    }
};

// Restore backup
const restoreBackup = async (backupFile) => {
    try {
        const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        const collections = Object.keys(data).filter(key => key !== '_metadata');
        
        for (const name of collections) {
            const collection = mongoose.connection.db.collection(name);
            await collection.deleteMany({});
            if (data[name].length > 0) {
                await collection.insertMany(data[name]);
            }
            console.log(`✅ Restored collection: ${name} (${data[name].length} records)`);
        }
        
        console.log(`✅ Backup restored: ${backupFile}`);
        return true;
    } catch (error) {
        console.error('❌ Restore error:', error);
        throw error;
    }
};

// List backups
const listBackups = (backupPath) => {
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
        return [];
    }
    
    const files = fs.readdirSync(backupPath);
    return files
        .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
        .map(f => ({
            filename: f,
            path: path.join(backupPath, f),
            size: fs.statSync(path.join(backupPath, f)).size,
            created: fs.statSync(path.join(backupPath, f)).birthtime
        }))
        .sort((a, b) => b.created - a.created);
};

module.exports = {
    createBackup,
    restoreBackup,
    listBackups
};
