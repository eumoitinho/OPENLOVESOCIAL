const fs = require('fs');
const path = require('path');

function cleanAllDuplicateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find the last closing brace of the component/function
  const lines = content.split('\n');
  let lastExportLine = -1;
  
  // Find where the main export ends
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === '}' || line.match(/^}\s*;?\s*$/)) {
      // Check if this is likely the end of a component
      let braceCount = 0;
      for (let j = i; j >= 0; j--) {
        for (let char of lines[j]) {
          if (char === '{') braceCount--;
          if (char === '}') braceCount++;
        }
      }
      if (braceCount === 1) {
        lastExportLine = i;
        break;
      }
    }
  }
  
  if (lastExportLine !== -1) {
    // Check if there are imports after the last export
    let hasImportsAfter = false;
    for (let i = lastExportLine + 1; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        hasImportsAfter = true;
        break;
      }
    }
    
    if (hasImportsAfter) {
      // Keep only lines up to and including the last export
      lines.splice(lastExportLine + 1);
      content = lines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned trailing imports in: ${filePath}`);
      modified = true;
    }
  }
  
  return modified;
}

function getAllTsxFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'build', '.git', 'new features'].includes(item)) {
          walk(fullPath);
        }
      } else if (item.endsWith('.tsx') && !item.includes('backup') && !item.includes('-old')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

console.log('Starting comprehensive cleanup of all duplicate imports...');

const appDir = path.join(__dirname, '..', 'app');
const componentsDir = path.join(__dirname, '..', 'components');

const files = [
  ...getAllTsxFiles(appDir),
  ...getAllTsxFiles(componentsDir)
];

let cleanedCount = 0;

for (const file of files) {
  if (cleanAllDuplicateImports(file)) {
    cleanedCount++;
  }
}

console.log(`\nCleaned trailing imports in ${cleanedCount} files.`);
console.log('Cleanup process completed!');