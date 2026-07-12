const mongoose = require('mongoose');

const uri = 'mongodb://kmunta600_db_user:j3L6BhZ323b3mIK0@ac-vn1mapw-shard-00-00.m75px6q.mongodb.net:27017,ac-vn1mapw-shard-00-01.m75px6q.mongodb.net:27017,ac-vn1mapw-shard-00-02.m75px6q.mongodb.net:27017/medox_pharmacy?ssl=true&replicaSet=atlas-tpe2bp-shard-0&authSource=admin&appName=Cluster0';

console.log('📤 Connecting to MongoDB Atlas (Legacy)...');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅✅✅ Connected to MongoDB Atlas!');
    console.log('   Database: medox_pharmacy');
    console.log('   Cluster: Cluster0 (Atlas)');
    console.log('   Status: READY');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    console.error('   Make sure your IP is whitelisted in Atlas');
    process.exit(1);
  });
