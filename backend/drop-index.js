const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/medoxpharmacy')
  .then(async () => {
    try {
      // Drop the unique index on code field
      await mongoose.connection.db.collection('products').dropIndex('code_1');
      console.log('✅ Dropped unique index on code field');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️ Index already dropped or doesn\'t exist');
      } else {
        console.error('Error dropping index:', err);
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
