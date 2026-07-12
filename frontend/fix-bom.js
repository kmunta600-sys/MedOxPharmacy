const fs = require('fs');
const path = 'package.json';

// Read file as buffer to preserve encoding
const data = fs.readFileSync(path);

// Check for BOM (EF BB BF)
if (data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
    console.log('✅ Found BOM - Removing...');
    // Remove BOM and write back as UTF-8 without BOM
    const content = data.slice(3).toString('utf8');
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ BOM removed successfully!');
} else {
    console.log('✅ No BOM found.');
}

// Also fix vercel.json if it exists
if (fs.existsSync('vercel.json')) {
    const vData = fs.readFileSync('vercel.json');
    if (vData[0] === 0xEF && vData[1] === 0xBB && vData[2] === 0xBF) {
        console.log('✅ Found BOM in vercel.json - Removing...');
        const vContent = vData.slice(3).toString('utf8');
        fs.writeFileSync('vercel.json', vContent, 'utf8');
        console.log('✅ BOM removed from vercel.json!');
    }
}
