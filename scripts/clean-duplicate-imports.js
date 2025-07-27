const fs = require('fs');
const path = require('path');

function cleanDuplicateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern to find imports added after the closing brace
  const pattern = /}\s*\nimport\s+{[^}]+}\s+from\s+["'][^"']+["']\s*$/gm;
  
  if (pattern.test(content)) {
    // Remove imports that appear after the final closing brace
    content = content.replace(pattern, '}');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned duplicate imports in: ${filePath}`);
    return true;
  }
  
  return false;
}

function getAllTsxFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          walk(fullPath);
        }
      } else if (item.endsWith('.tsx') && !item.includes('backup') && !item.includes('old')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

console.log('Starting cleanup of duplicate imports...');

const appDir = path.join(__dirname, '..', 'app');
const componentsDir = path.join(__dirname, '..', 'components');

const files = [
  ...getAllTsxFiles(appDir),
  ...getAllTsxFiles(componentsDir)
];

let cleanedCount = 0;

for (const file of files) {
  if (cleanDuplicateImports(file)) {
    cleanedCount++;
  }
}

console.log(`\nCleaned duplicate imports in ${cleanedCount} files.`);
console.log('Cleanup process completed!');