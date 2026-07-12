const fs = require('fs');
const path = 'package.json';

// Read file as buffer
const data = fs.readFileSync(path);

// Check for BOM (EF BB BF)
if (data.length >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
    console.log('✅ Found BOM - Removing...');
    // Write without BOM
    const content = data.slice(3).toString('utf8');
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ BOM removed!');
} else {
    console.log('✅ No BOM found.');
}

// Verify the JSON is valid
try {
    const verified = fs.readFileSync(path, 'utf8');
    JSON.parse(verified);
    console.log('✅ package.json is valid JSON!');
} catch (err) {
    console.error('❌ package.json is still invalid:', err.message);
}
