const mongoose = require('mongoose');

const uri = 'mongodb+srv://kmunta600_db_user:j3L6BhZ323b3mIK0@cluster0.m75px6q.mongodb.net/medox_pharmacy?retryWrites=true&w=majority&appName=Cluster0';

console.log('📤 Connecting to MongoDB Atlas...');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅✅✅ Connected to MongoDB Atlas!');
    console.log('   Database: medox_pharmacy');
    console.log('   Cluster: Cluster0');
    console.log('   Status: READY');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
