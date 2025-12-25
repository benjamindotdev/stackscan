const fs = require('fs');
const path = require('path');
const { techDefinitions } = require('../dist/techDefinitions');

const ASSETS_DIR = path.join(__dirname, '../assets/logos');
const MISSING_LOGOS = [];

// Helper to recursively get all files
function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

const allAssets = getAllFiles(ASSETS_DIR).map(f => path.relative(ASSETS_DIR, f).replace(/\\/g, '/'));
const assetSet = new Set(allAssets);
const assetBaseNames = new Map(); // filename -> relative path

allAssets.forEach(f => {
    assetBaseNames.set(path.basename(f), f);
});

console.log(`Checking ${techDefinitions.length} definitions for missing logos...`);

techDefinitions.forEach(def => {
    // Normalize path separators
    const logoPath = def.logo.replace(/\\/g, '/');
    
    if (!assetSet.has(logoPath)) {
        const baseName = path.basename(logoPath);
        const foundElsewhere = assetBaseNames.get(baseName);

        MISSING_LOGOS.push({
            name: def.name,
            expected: logoPath,
            found: foundElsewhere || null
        });
    }
});

if (MISSING_LOGOS.length > 0) {
    console.log('\nMissing or Misplaced Logos:');
    MISSING_LOGOS.forEach(item => {
        if (item.found) {
            console.log(`[MISPLACED] ${item.name}`);
            console.log(`  Expected: ${item.expected}`);
            console.log(`  Found at: ${item.found}`);
        } else {
            console.log(`[MISSING]   ${item.name} (${item.expected})`);
        }
    });
    console.log(`\nTotal issues: ${MISSING_LOGOS.length}`);
} else {
    console.log('\nAll logos found!');
}
