const mongoose = require('mongoose');

const uri = 'mongodb+srv://kmunta600_db_user:j3L6BhZ323b3mIK0@ac-vn1mapw-shard-00-00.m75px6q.mongodb.net:27017,ac-vn1mapw-shard-00-01.m75px6q.mongodb.net:27017,ac-vn1mapw-shard-00-02.m75px6q.mongodb.net:27017/?ssl=true&replicaSet=atlas-tpe2bp-shard-0&authSource=admin&appName=Cluster0/medox_pharmacy';

console.log('📤 Connecting to MongoDB Atlas...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
    console.log('   Database: medox_pharmacy');
    console.log('   Cluster: Cluster0');
    console.log('   Status: READY');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
